import React from "react";
import { useAttribution } from "./AttributionProvider";

export const AttributionReferenceList: React.FC = () => {
  const { attributionReferences } = useAttribution();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "page":
        return "📄";
      case "product":
        return "🛍️";
      case "collection":
        return "📦";
      default:
        return "📄";
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "#3b82f6";
      case "product":
        return "#22c55e";
      case "collection":
        return "#f59e0b";
      default:
        return "#a3a3a3";
    }
  };

  if (attributionReferences.length === 0) {
    return (
      <p style={{ color: "#a3a3a3", textAlign: "center", padding: "2rem" }}>
        No attribution references found
      </p>
    );
  }

  return (
    <ul className="attribution-reference-list">
      {attributionReferences.slice(0, 10).map((reference) => (
        <li key={reference._id} className="attribution-item">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <h3 className="content-title">{reference.contentTitle}</h3>
              <p
                className="content-type"
                style={{
                  color: getContentTypeColor(reference.contentType),
                  fontWeight: "600",
                }}
              >
                {getContentTypeIcon(reference.contentType)}{" "}
                {reference.contentType.toUpperCase()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="sales-value">
                ${reference.currentSalesValue?.toFixed(2) || "0.00"}
              </p>
              <p style={{ color: "#a3a3a3", fontSize: "0.75rem", margin: "0" }}>
                {reference.addToCartCount || 0} add to carts
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "1rem" }}>
              <span style={{ color: "#a3a3a3", fontSize: "0.75rem" }}>
                Conversion: {((reference.conversionRate || 0) * 100).toFixed(1)}
                %
              </span>
              <span style={{ color: "#a3a3a3", fontSize: "0.75rem" }}>
                Status: {reference.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: reference.isActive ? "#22c55e" : "#6b7280",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
