import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContextProvider";
import { assets } from "../../assets/assets";
import "./MyOrders.css";

const ORDERS_PER_PAGE = 5;

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    if (!token || !url) {
      setLoading(false);
      setOrders([]);
      return;
    }
    try {
      const response = await axios.get(`${url}/api/order/userorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.success ? response.data.orders : []);
    } catch (error) {
      setOrders([]);
      // bisa tampilkan error jika mau
    } finally {
      setLoading(false);
    }
  };

  // fetch saat token berubah ATAU saat page di-mount
  useEffect(() => {
    setLoading(true);
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  // reset expand setiap ganti page
  useEffect(() => {
    setExpandedIdx(null);
  }, [currentPage]);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {orders.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center" }}>
            You have no orders.
          </p>
        ) : (
          currentOrders.map((order, index) => {
            const idxOrders = startIndex + index;
            const previewItems =
              order.items.length > 2
                ? order.items
                    .slice(0, 2)
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ") + "..."
                : order.items
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ");

            return (
              <div
                key={order._id || idxOrders}
                className={`my-orders-order${expandedIdx === idxOrders ? " expanded" : ""}`}
                onClick={() =>
                  setExpandedIdx(expandedIdx === idxOrders ? null : idxOrders)
                }
                style={{ cursor: "pointer" }}
                title="Click to expand/collapse details"
              >
                <img src={assets.parcel_icon} alt="parcel" />
                <p className="order-items">{previewItems}</p>
                <p className="order-amount">${order.amount?.toFixed(2)}</p>
                <p className="order-qty">Items: {order.items.length}</p>
                <p className="order-status">
                  <span>&#x25cf;</span> <b>{order.status}</b>
                </p>
                <button
                  className="order-track-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchOrders();
                  }}
                >
                  Track Order
                </button>

                {expandedIdx === idxOrders && (
                  <div className="order-details-expand">
                    <h4>Order Details</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price?.toFixed(2) ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="order-details-summary">
                      <b>Order Total:</b> ${order.amount?.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination Controls */}
        {orders.length > ORDERS_PER_PAGE && (
          <div
            className="pagination-controls"
            style={{ textAlign: "center", margin: "22px 0 8px 0" }}
          >
            <button
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
              title="Previous"
            >
              ⬅️
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                marginLeft: 8,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
              title="Next"
            >
              ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
