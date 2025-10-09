import React, {createContext, useContext, useEffect, useState} from "react";
import {useClient} from "@sanity/sdk-react";

interface UtmParam {
  _key?: string;
  key?: string;
  value?: string;
}

interface AttributionEventRecord {
  _id: string;
  sessionId?: string;
  value?: number | null;
  currencyCode?: string | null;
  createdAt?: string | null;
  landingTimestamp?: string | null;
  landingUrl?: string | null;
  cartId?: string | null;
  checkoutUrl?: string | null;
  totalQuantity?: number | null;
  utm?: UtmParam[];
  pageTitle?: string | null;
  pageSlug?: string | null;
  page?: {
    _id?: string;
    title?: string | null;
    slug?: string | null;
  } | null;
}

interface PageSummary {
  pageId: string;
  pageTitle: string;
  pageSlug?: string | null;
  currencyCode?: string | null;
  totalValue: number;
  eventCount: number;
  averageValue: number;
  lastEventAt?: string | null;
}

interface CurrencyTotal {
  currency: string | null;
  totalValue: number;
}

interface UtmSummary {
  source: string;
  key: string;
  currencyCode?: string | null;
  totalValue: number;
  eventCount: number;
}

interface AttributionData {
  events: AttributionEventRecord[];
  pageSummaries: PageSummary[];
  utmSummaries: UtmSummary[];
  totalsByCurrency: CurrencyTotal[];
  primaryCurrency: string | null;
  totalValue: number;
  totalEvents: number;
  uniquePages: number;
  isLoading: boolean;
  error: string | null;
}

interface AttributionContextType extends AttributionData {
  refreshData: () => Promise<void>;
}

const AttributionContext = createContext<AttributionContextType | undefined>(
  undefined,
);

export const useAttribution = () => {
  const context = useContext(AttributionContext);
  if (!context) {
    throw new Error(
      "useAttribution must be used within an AttributionProvider",
    );
  }
  return context;
};

interface AttributionProviderProps {
  children: React.ReactNode;
}

const INITIAL_STATE: AttributionData = {
  events: [],
  pageSummaries: [],
  utmSummaries: [],
  totalsByCurrency: [],
  primaryCurrency: null,
  totalValue: 0,
  totalEvents: 0,
  uniquePages: 0,
  isLoading: true,
  error: null,
};

export const AttributionProvider: React.FC<AttributionProviderProps> = ({
  children,
}) => {
  const client = useClient({apiVersion: "2025-10-09"});
  const [state, setState] = useState<AttributionData>(INITIAL_STATE);

  const fetchAttributionData = async () => {
    try {
      setState((prev) => ({...prev, isLoading: true, error: null}));

      const events = await client.fetch<AttributionEventRecord[]>(`
        *[_type == "attributionEvent"] | order(coalesce(createdAt, landingTimestamp) desc) [0...200] {
          _id,
          sessionId,
          value,
          currencyCode,
          createdAt,
          landingTimestamp,
          landingUrl,
          cartId,
          checkoutUrl,
          totalQuantity,
          utm,
          pageTitle,
          pageSlug,
          "page": page-> {
            _id,
            title,
            "slug": slug.current
          }
        }
      `);

      const currencyMap = new Map<string, number>();
      const pageMap = new Map<string, PageSummary>();
      const utmMap = new Map<string, UtmSummary>();

      events.forEach((event) => {
        const amount =
          typeof event.value === "number" && Number.isFinite(event.value)
            ? event.value
            : 0;
        const currency = event.currencyCode ?? null;
        const currencyKey = currency ?? "__UNSPECIFIED__";

        currencyMap.set(
          currencyKey,
          (currencyMap.get(currencyKey) ?? 0) + amount,
        );

        const pageId =
          event.page?._id ??
          event.pageTitle ??
          event.pageSlug ??
          "unassigned";
        const pageTitle =
          event.page?.title ?? event.pageTitle ?? "Untitled page";
        const pageSlug = event.page?.slug ?? event.pageSlug;
        const pageKey = `${pageId}::${currencyKey}`;
        const timestamp = event.createdAt ?? event.landingTimestamp ?? null;

        const existingPage = pageMap.get(pageKey);
        if (existingPage) {
          existingPage.totalValue += amount;
          existingPage.eventCount += 1;
          existingPage.pageTitle = existingPage.pageTitle || pageTitle;
          existingPage.pageSlug = existingPage.pageSlug || pageSlug;
          existingPage.currencyCode = existingPage.currencyCode ?? currency;
          if (
            timestamp &&
            (!existingPage.lastEventAt || timestamp > existingPage.lastEventAt)
          ) {
            existingPage.lastEventAt = timestamp;
          }
        } else {
          pageMap.set(pageKey, {
            pageId,
            pageTitle,
            pageSlug,
            currencyCode: currency,
            totalValue: amount,
            eventCount: 1,
            averageValue: 0,
            lastEventAt: timestamp,
          });
        }

        const rawSource =
          event.utm?.find((param) => param?.key === "utm_source")?.value?.trim() ??
          null;
        const normalizedSource = rawSource?.toLowerCase() ?? "direct / none";
        const displaySource = rawSource ?? "direct / none";
        const utmKey = `${normalizedSource}::${currencyKey}`;
        const existingSource = utmMap.get(utmKey);
        if (existingSource) {
          existingSource.totalValue += amount;
          existingSource.eventCount += 1;
        } else {
          utmMap.set(utmKey, {
            source: displaySource,
            key: "utm_source",
            currencyCode: currency,
            totalValue: amount,
            eventCount: 1,
          });
        }
      });

      const totalsByCurrency: CurrencyTotal[] = Array.from(
        currencyMap.entries(),
      )
        .map(([currencyKey, totalValue]) => ({
          currency: currencyKey === "__UNSPECIFIED__" ? null : currencyKey,
          totalValue,
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

      const primaryCurrency = totalsByCurrency[0]?.currency ?? null;
      const totalValue = totalsByCurrency[0]?.totalValue ?? 0;

      const pageSummaries: PageSummary[] = Array.from(pageMap.values())
        .map((summary) => ({
          ...summary,
          averageValue:
            summary.totalValue / (summary.eventCount || 1),
        }))
        .sort((a, b) => b.totalValue - a.totalValue);

      const utmSummaries: UtmSummary[] = Array.from(utmMap.values()).sort(
        (a, b) => b.totalValue - a.totalValue,
      );

      setState({
        events,
        pageSummaries,
        utmSummaries,
        totalsByCurrency,
        primaryCurrency,
        totalValue,
        totalEvents: events.length,
        uniquePages: pageSummaries.length,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching attribution events:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch attribution data",
      }));
    }
  };

  useEffect(() => {
    fetchAttributionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async () => {
    await fetchAttributionData();
  };

  return (
    <AttributionContext.Provider value={{...state, refreshData}}>
      {children}
    </AttributionContext.Provider>
  );
};
