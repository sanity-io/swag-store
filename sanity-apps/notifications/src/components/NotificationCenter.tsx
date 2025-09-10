import React, { useState, useEffect } from "react";
import { createClient } from "@sanity/client";
import { NotificationItem } from "./NotificationItem";
import { NotificationFilters } from "./NotificationFilters";
import "./NotificationCenter.css";

interface NotificationDocument {
  _id: string;
  _type: "notification";
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  source?: string;
  metadata?: any;
  isRead: boolean;
  expiresAt: string;
  createdAt: string;
}

// Initialize Sanity client
const client = createClient({
  projectId: "l3u4li5b", // Using the project ID from App.tsx
  dataset: "production",
  useCdn: false,
  apiVersion: "2023-05-03",
});

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationDocument[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showReadNotifications, setShowReadNotifications] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const filter = buildFilter(statusFilter, showReadNotifications);
      const query = `*[_type == "notification" ${filter ? `&& ${filter}` : ""}] | order(createdAt desc)[0...20]`;

      const result = await client.fetch<NotificationDocument[]>(query);

      if (reset) {
        setNotifications(result);
      } else {
        setNotifications((prev) => [...prev, ...result]);
      }

      setHasMore(result.length === 20);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [statusFilter, showReadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await client.patch(notificationId).set({ isRead: true }).commit();

      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      for (const notification of unreadNotifications) {
        await client.patch(notification._id).set({ isRead: true }).commit();
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <div className="notification-loading">Loading notifications...</div>;
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h1>
          Notifications
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h1>

        <div className="notification-actions">
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <NotificationFilters
        statusFilter={statusFilter}
        showReadNotifications={showReadNotifications}
        onStatusFilterChange={setStatusFilter}
        onShowReadChange={setShowReadNotifications}
      />

      <div className="notification-list">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={() => markAsRead(notification._id)}
          />
        ))}

        {hasMore && !loadingMore && (
          <button className="load-more-btn" onClick={loadMore}>
            Load More
          </button>
        )}

        {loadingMore && (
          <div className="loading-more">Loading more notifications...</div>
        )}

        {notifications.length === 0 && (
          <div className="empty-state">
            <p>No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function buildFilter(
  statusFilter: string | null,
  showReadNotifications: boolean
): string {
  const conditions = [];

  if (statusFilter) {
    conditions.push(`status == "${statusFilter}"`);
  }

  if (!showReadNotifications) {
    conditions.push("isRead != true");
  }

  // Filter out expired notifications
  conditions.push("expiresAt > now()");

  return conditions.length > 0 ? conditions.join(" && ") : "";
}
