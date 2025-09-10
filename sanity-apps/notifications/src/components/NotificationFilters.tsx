import React from "react";
import "./NotificationFilters.css";

interface NotificationFiltersProps {
  statusFilter: string | null;
  showReadNotifications: boolean;
  onStatusFilterChange: (status: string | null) => void;
  onShowReadChange: (showRead: boolean) => void;
}

export function NotificationFilters({
  statusFilter,
  showReadNotifications,
  onStatusFilterChange,
  onShowReadChange,
}: NotificationFiltersProps) {
  return (
    <div className="notification-filters">
      <div className="filter-group">
        <label className="filter-label">Status:</label>
        <div className="status-filters">
          <button
            className={`status-filter-btn ${statusFilter === null ? "active" : ""}`}
            onClick={() => onStatusFilterChange(null)}
          >
            All
          </button>
          <button
            className={`status-filter-btn success ${statusFilter === "success" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("success")}
          >
            ✅ Success
          </button>
          <button
            className={`status-filter-btn warning ${statusFilter === "warning" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("warning")}
          >
            ⚠️ Warning
          </button>
          <button
            className={`status-filter-btn error ${statusFilter === "error" ? "active" : ""}`}
            onClick={() => onStatusFilterChange("error")}
          >
            ❌ Error
          </button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={showReadNotifications}
            onChange={(e) => onShowReadChange(e.target.checked)}
          />
          Show read notifications
        </label>
      </div>
    </div>
  );
}
