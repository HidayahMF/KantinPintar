import React, { useEffect, useState } from "react";
import "./CustomerServiceAdmin.css";
import axios from "axios";
import CustomerServiceAdminRoom from "../CustomerServiceAdminRoom/CustomerServiceAdminRoom";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:4000") + "/api/message";

const ROOMS_PER_PAGE = 5;

const CustomerServiceAdmin = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

 
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL + "/users");
      if (res.data.success) {
       
        const sortedRooms = [...res.data.data].sort((a, b) => {
          if (a.lastMessageAt && b.lastMessageAt)
            return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
          if (a._id < b._id) return 1;
          if (a._id > b._id) return -1;
          return 0;
        });
        setRooms(sortedRooms);
      }
    } catch (e) {
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);


  const totalPages = Math.ceil(rooms.length / ROOMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROOMS_PER_PAGE;
  const roomsPage = rooms.slice(startIdx, startIdx + ROOMS_PER_PAGE);

  const handleOpenRoom = async (email) => {
    setSelectedEmail(email);
    try {
      await axios.patch(`${API_URL}/room/${email}/admin-read`); 
      fetchRooms();
    } catch {}
  };

  return (
    <div className="cs-admin-container">
      <h2>Chat User List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : rooms.length === 0 ? (
        <p>No chat.</p>
      ) : (
        <div className="cs-admin-list">
          {roomsPage.map((room) => (
            <div
              className={`cs-admin-msg${room.status === "done" ? " done" : ""}`}
              key={room.email}
              style={{ cursor: "pointer", position: "relative" }}
              onClick={() => handleOpenRoom(room.email)}
            >
              <b>{room.name}</b> <span>({room.email})</span>
              <span
                className={`cs-admin-status ${room.status === "done" ? "done" : "open"}`}
                style={{ marginLeft: 12 }}
              >
                {room.status === "done" ? "Selesai" : "Baru"}
              </span>
              <div style={{ marginTop: 5, color: "#444" }}>
                {room.firstMessage}
              </div>
              {room.unreadCount > 0 && (
                <span className="notif-badge">{room.unreadCount}</span>
              )}
            </div>
          ))}
       
          {rooms.length > ROOMS_PER_PAGE && (
            <div className="cs-admin-pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "13px", margin: "18px 0 6px 0" }}>
              <button
                className="icon-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ marginRight: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
                title="Prev"
              >
                ⬅️
              </button>
              <span>
                <b>{currentPage}</b> / {totalPages}
              </span>
              <button
                className="icon-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ marginLeft: 8, opacity: currentPage === totalPages ? 0.5 : 1 }}
                title="Next"
              >
                ➡️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ROOM CHAT */}
      {selectedEmail && (
        <CustomerServiceAdminRoom
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onStatusChange={fetchRooms}
        />
      )}
    </div>
  );
};

export default CustomerServiceAdmin;
