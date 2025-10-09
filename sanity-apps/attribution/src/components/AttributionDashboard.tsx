import React from "react";
import { useAttribution } from "./AttributionProvider";
import { CampaignList } from "./CampaignList";
import { OrderList } from "./OrderList";
import { AttributionReferenceList } from "./AttributionReferenceList";
import { MetricsOverview } from "./MetricsOverview";

export const AttributionDashboard: React.FC = () => {
  const { isLoading, error, refreshData } = useAttribution();

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Attribution Dashboard</h1>
        </div>
        <div className="loading">Loading attribution data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Attribution Dashboard</h1>
        </div>
        <div className="error">
          Error loading data: {error}
          <button
            onClick={refreshData}
            style={{
              marginLeft: "1rem",
              padding: "0.5rem 1rem",
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Attribution Dashboard</h1>
        <button
          onClick={refreshData}
          style={{
            padding: "0.5rem 1rem",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh Data
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2 className="section-title">Metrics Overview</h2>
          <MetricsOverview />
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Recent Orders</h2>
          <OrderList />
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Active Campaigns</h2>
          <CampaignList />
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Top Performing Content</h2>
          <AttributionReferenceList />
        </div>
      </div>
    </div>
  );
};
