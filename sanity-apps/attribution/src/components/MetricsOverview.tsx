import React from "react";
import { useAttribution } from "./AttributionProvider";

export const MetricsOverview: React.FC = () => {
  const { totalRevenue, totalOrders, campaigns, attributionReferences } =
    useAttribution();

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.campaignStatus === "active"
  ).length;
  const totalAddToCarts = attributionReferences.reduce(
    (sum, ref) => sum + (ref.addToCartCount || 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      <div className="metric-card">
        <p className="metric-value">${totalRevenue.toFixed(2)}</p>
        <p className="metric-label">Total Revenue</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">{totalOrders}</p>
        <p className="metric-label">Total Orders</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">${averageOrderValue.toFixed(2)}</p>
        <p className="metric-label">Average Order Value</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">{activeCampaigns}</p>
        <p className="metric-label">Active Campaigns</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">{totalAddToCarts}</p>
        <p className="metric-label">Total Add to Carts</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">{attributionReferences.length}</p>
        <p className="metric-label">Tracked Content Items</p>
      </div>
    </div>
  );
};
