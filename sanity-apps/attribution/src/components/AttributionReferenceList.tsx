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

export const AttributionReferenceList: React.FC = () => {
  const {utmSummaries, primaryCurrency} = useAttribution();

  if (utmSummaries.length === 0) {
    return (
      <p style={{color: "#a3a3a3", textAlign: "center", padding: "2rem"}}>
        No UTM information captured yet
      </p>
    );
  }

  return (
    <ul className="attribution-reference-list">
      {utmSummaries.slice(0, 10).map((entry) => {
        const currency = entry.currencyCode ?? primaryCurrency;
        return (
          <li key={`${entry.source}-${currency ?? 'unknown'}`} className="attribution-item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3 className="content-title">{entry.source}</h3>
                <p className="content-type">{entry.key.toUpperCase()}</p>
              </div>
              <div style={{textAlign: "right"}}>
                <p className="sales-value">
                  {formatCurrency(entry.totalValue, currency)}
                </p>
                <p
                  style={{
                    color: "#a3a3a3",
                    fontSize: "0.75rem",
                    margin: 0,
                  }}
                >
                  {entry.eventCount} event{entry.eventCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
