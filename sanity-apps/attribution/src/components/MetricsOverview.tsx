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

export const MetricsOverview: React.FC = () => {
  const {
    totalValue,
    totalEvents,
    uniquePages,
    pageSummaries,
    utmSummaries,
    primaryCurrency,
    totalsByCurrency,
  } = useAttribution();

  const averageValue = totalEvents > 0 ? totalValue / totalEvents : 0;
  const topPage = pageSummaries[0];
  const topSource = utmSummaries[0];
  const additionalCurrencies = totalsByCurrency.slice(1);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
      }}
    >
      <div className="metric-card">
        <p className="metric-value">
          {formatCurrency(totalValue, primaryCurrency)}
        </p>
        <p className="metric-label">Total Attributed Value</p>
        {additionalCurrencies.length > 0 && (
          <p className="metric-subtext">
            + {additionalCurrencies.length} other currency value
            {additionalCurrencies.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="metric-card">
        <p className="metric-value">{totalEvents}</p>
        <p className="metric-label">Attributed Events</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">
          {totalEvents > 0
            ? formatCurrency(averageValue, primaryCurrency)
            : "—"}
        </p>
        <p className="metric-label">Average Event Value</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">{uniquePages}</p>
        <p className="metric-label">Pages Driving Value</p>
      </div>

      <div className="metric-card">
        <p className="metric-value">
          {topPage
            ? formatCurrency(
                topPage.totalValue,
                topPage.currencyCode ?? primaryCurrency,
              )
            : "—"}
        </p>
        <p className="metric-label">
          Top Page{topPage ? `: ${topPage.pageTitle}` : ""}
        </p>
      </div>

      <div className="metric-card">
        <p className="metric-value">
          {topSource
            ? formatCurrency(topSource.totalValue, topSource.currencyCode ?? primaryCurrency)
            : "—"}
        </p>
        <p className="metric-label">
          Top UTM Source{topSource ? `: ${topSource.source}` : ""}
        </p>
      </div>
    </div>
  );
};
