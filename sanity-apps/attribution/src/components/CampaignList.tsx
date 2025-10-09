import React from "react";
import { useAttribution } from "./AttributionProvider";

export const CampaignList: React.FC = () => {
  const { campaigns } = useAttribution();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "draft":
        return "status-draft";
      case "paused":
        return "status-paused";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-draft";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString();
  };

  if (campaigns.length === 0) {
    return (
      <p style={{ color: "#a3a3a3", textAlign: "center", padding: "2rem" }}>
        No campaigns found
      </p>
    );
  }

  return (
    <ul className="campaign-list">
      {campaigns.slice(0, 10).map((campaign) => (
        <li key={campaign._id} className="campaign-item">
          <div>
            <h3 className="campaign-name">{campaign.campaignName}</h3>
            <p
              style={{
                color: "#a3a3a3",
                fontSize: "0.875rem",
                margin: "0.25rem 0",
              }}
            >
              {campaign.pageTitle}
            </p>
            <p style={{ color: "#a3a3a3", fontSize: "0.75rem", margin: "0" }}>
              Revenue: $
              {campaign.revenueMetrics?.totalRevenue?.toFixed(2) || "0.00"} •
              Orders: {campaign.revenueMetrics?.totalOrders || 0} • Started:{" "}
              {formatDate(campaign.startDate)}
            </p>
          </div>
          <span
            className={`campaign-status ${getStatusClass(campaign.campaignStatus)}`}
          >
            {campaign.campaignStatus}
          </span>
        </li>
      ))}
    </ul>
  );
};
