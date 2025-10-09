import React from "react";
import {useAttribution} from "./AttributionProvider";

const formatCurrency = (value: number, currency: string | null) => {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.warn("Unable to format currency", currency, error);
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  return value.toFixed(2);
};

export const CampaignList: React.FC = () => {
  const {pageSummaries, primaryCurrency} = useAttribution();

  if (pageSummaries.length === 0) {
    return (
      <p style={{color: "#a3a3a3", textAlign: "center", padding: "2rem"}}>
        No pages have attributed events yet
      </p>
    );
  }

  return (
    <ul className="campaign-list">
      {pageSummaries.slice(0, 10).map((page) => {
        const currency = page.currencyCode ?? primaryCurrency;
        return (
          <li key={`${page.pageId}-${currency ?? 'unknown'}`} className="campaign-item">
            <div>
              <p className="campaign-name">{page.pageTitle}</p>
              <p className="order-details">
                {page.eventCount} event{page.eventCount === 1 ? "" : "s"} • Avg {formatCurrency(page.averageValue, currency)}
              </p>
              {page.pageSlug ? (
                <p className="order-details">Slug: {page.pageSlug}</p>
              ) : null}
            </div>
            <div style={{textAlign: "right"}}>
              <p className="sales-value">
                {formatCurrency(page.totalValue, currency)}
              </p>
              {page.lastEventAt ? (
                <p
                  style={{
                    color: "#a3a3a3",
                    fontSize: "0.75rem",
                    margin: 0,
                  }}
                >
                  Last event: {new Date(page.lastEventAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
