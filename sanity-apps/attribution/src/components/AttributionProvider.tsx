import React, { createContext, useContext, useState, useEffect } from "react";
import { useClient } from "@sanity/sdk-react";

interface AttributionData {
  orders: any[];
  campaigns: any[];
  attributionReferences: any[];
  totalRevenue: number;
  totalOrders: number;
  isLoading: boolean;
  error: string | null;
}

interface AttributionContextType extends AttributionData {
  refreshData: () => Promise<void>;
}

const AttributionContext = createContext<AttributionContextType | undefined>(
  undefined
);

export const useAttribution = () => {
  const context = useContext(AttributionContext);
  if (!context) {
    throw new Error(
      "useAttribution must be used within an AttributionProvider"
    );
  }
  return context;
};

interface AttributionProviderProps {
  children: React.ReactNode;
}

export const AttributionProvider: React.FC<AttributionProviderProps> = ({
  children,
}) => {
  const client = useClient({ apiVersion: "2025-10-09" });
  const [data, setData] = useState<AttributionData>({
    orders: [],
    campaigns: [],
    attributionReferences: [],
    totalRevenue: 0,
    totalOrders: 0,
    isLoading: true,
    error: null,
  });

  const fetchAttributionData = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      // Fetch orders
      const orders = await client.fetch(`
        *[_type == "order"] | order(orderDate desc) [0...50] {
          _id,
          orderNumber,
          customerEmail,
          totalAmount,
          currency,
          orderDate,
          paymentStatus,
          fulfillmentStatus,
          products[] {
            title,
            quantity,
            totalPrice
          }
        }
      `);

      // Fetch campaigns
      const campaigns = await client.fetch(`
        *[_type == "attribution_campaign"] | order(createdAt desc) [0...20] {
          _id,
          campaignName,
          pageTitle,
          campaignStatus,
          "revenueMetrics": revenueMetrics {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            conversionRate
          },
          startDate,
          endDate
        }
      `);

      // Fetch attribution references
      const attributionReferences = await client.fetch(`
        *[_type == "attribution_reference"] | order(currentSalesValue desc) [0...20] {
          _id,
          contentTitle,
          contentType,
          currentSalesValue,
          addToCartCount,
          conversionRate,
          isActive
        }
      `);

      // Calculate totals
      const totalRevenue = orders.reduce(
        (sum: number, order: any) => sum + (order.totalAmount || 0),
        0
      );
      const totalOrders = orders.length;

      setData({
        orders,
        campaigns,
        attributionReferences,
        totalRevenue,
        totalOrders,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching attribution data:", error);
      setData((prev) => ({
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
  }, []);

  const refreshData = async () => {
    await fetchAttributionData();
  };

  return (
    <AttributionContext.Provider value={{ ...data, refreshData }}>
      {children}
    </AttributionContext.Provider>
  );
};
