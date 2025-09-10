import React from "react";
import { formatDistanceToNow } from "date-fns";
import "./NotificationItem.css";

interface NotificationDocument {
  _id: string;
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  source?: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: NotificationDocument;
  onMarkAsRead: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const statusConfig = {
    success: {
      className: "notification-success",
      icon: "✅",
      color: "#22c55e",
    },
    warning: {
      className: "notification-warning",
      icon: "⚠️",
      color: "#f59e0b",
    },
    error: {
      className: "notification-error",
      icon: "❌",
      color: "#ef4444",
    },
  };

  const config = statusConfig[notification.status];
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`notification-item ${config.className} ${notification.isRead ? "read" : "unread"}`}
      style={{ borderLeftColor: config.color }}
    >
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-icon">{config.icon}</span>
          <h3 className="notification-title">{notification.title}</h3>
          {!notification.isRead && (
            <button
              className="mark-read-btn"
              onClick={onMarkAsRead}
              title="Mark as read"
            >
              ✓
            </button>
          )}
        </div>

        <p className="notification-message">{notification.message}</p>

        <div className="notification-meta">
          <span className="notification-time">{timeAgo}</span>
          {notification.source && (
            <span className="notification-source">
              from {notification.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
