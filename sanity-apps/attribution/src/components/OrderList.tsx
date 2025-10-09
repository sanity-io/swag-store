import React from "react";
import {useAttribution} from "./AttributionProvider";

const formatCurrency = (value: number | null | undefined, currency: string | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
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

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export const OrderList: React.FC = () => {
  const {events, primaryCurrency} = useAttribution();

  if (events.length === 0) {
    return (
      <p style={{color: "#a3a3a3", textAlign: "center", padding: "2rem"}}>
        No attribution events recorded yet
      </p>
    );
  }

  return (
    <ul className="order-list">
      {events.slice(0, 12).map((event) => {
        const currency = event.currencyCode ?? primaryCurrency;
        const utmSource =
          event.utm?.find((param) => param?.key === "utm_source")?.value ??
          "direct / none";
        const utmCampaign = event.utm?.find(
          (param) => param?.key === "utm_campaign",
        )?.value;
        const utmMedium = event.utm?.find(
          (param) => param?.key === "utm_medium",
        )?.value;

        return (
          <li key={event._id} className="order-item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <div>
                <h3 className="content-title">
                  {event.page?.title ?? event.pageTitle ?? "Untitled page"}
                </h3>
                <p className="content-type" style={{color: "#a3a3a3"}}>
                  Session: {event.sessionId ?? "unknown"}
                </p>
              </div>
              <div style={{textAlign: "right", minWidth: "120px"}}>
                <p className="sales-value">
                  {formatCurrency(event.value ?? null, currency)}
                </p>
                <p
                  style={{
                    color: "#a3a3a3",
                    fontSize: "0.75rem",
                    margin: 0,
                  }}
                >
                  {formatDate(event.createdAt ?? event.landingTimestamp)}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "0.75rem",
              }}
            >
              <span className="tag">Source: {utmSource}</span>
              {utmMedium ? <span className="tag">Medium: {utmMedium}</span> : null}
              {utmCampaign ? (
                <span className="tag">Campaign: {utmCampaign}</span>
              ) : null}
              {event.totalQuantity ? (
                <span className="tag">Items: {event.totalQuantity}</span>
              ) : null}
            </div>

            {event.landingUrl ? (
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "#a3a3a3",
                  fontSize: "0.75rem",
                  overflowWrap: "anywhere",
                }}
              >
                Landing URL: {event.landingUrl}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};
