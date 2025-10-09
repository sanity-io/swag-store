import React from "react";
import { useAttribution } from "./AttributionProvider";

export const OrderList: React.FC = () => {
  const { orders } = useAttribution();

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#22c55e";
      case "pending":
        return "#f59e0b";
      case "partially_paid":
        return "#3b82f6";
      case "refunded":
        return "#ef4444";
      case "partially_refunded":
        return "#f59e0b";
      default:
        return "#a3a3a3";
    }
  };

  if (orders.length === 0) {
    return (
      <p style={{ color: "#a3a3a3", textAlign: "center", padding: "2rem" }}>
        No orders found
      </p>
    );
  }

  return (
    <ul className="order-list">
      {orders.slice(0, 10).map((order) => (
        <li key={order._id} className="order-item">
          <h3 className="order-number">Order #{order.orderNumber}</h3>
          <p className="order-details">
            <strong>Customer:</strong> {order.customerEmail} •
            <strong> Amount:</strong> {order.currency}{" "}
            {order.totalAmount?.toFixed(2)} •<strong> Date:</strong>{" "}
            {formatDate(order.orderDate)} •<strong> Status:</strong>
            <span
              style={{
                color: getStatusColor(order.paymentStatus),
                marginLeft: "0.25rem",
              }}
            >
              {order.paymentStatus}
            </span>
          </p>
          {order.products && order.products.length > 0 && (
            <p className="order-details" style={{ marginTop: "0.5rem" }}>
              <strong>Products:</strong>{" "}
              {order.products.map((product: any, index: number) => (
                <span key={index}>
                  {product.title} (x{product.quantity})
                  {index < order.products.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
};
