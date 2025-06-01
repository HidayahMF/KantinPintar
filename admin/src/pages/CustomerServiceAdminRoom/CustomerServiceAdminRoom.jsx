import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./CustomerServiceAdminRoom.css";

const API_URL = "http://localhost:4000/api/message";

const CustomerServiceAdminRoom = ({ email, onClose, onStatusChange }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("open");

  const chatEndRef = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/room/${email}`);
      if (res.data.success) setMessages(res.data.data);
    } catch {}
    setLoading(false);
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/room/${email}/status`);
      setStatus(res.data.status);
    } catch {}
  };

  // --- Polling 10 detik & stop saat inputFocus
  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!inputFocus) {
        await fetchMessages();
        await fetchStatus();
      }
      timer = setTimeout(poll, 10000); // 10 detik
    };
    poll();
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [email, inputFocus]);

  // Auto-scroll hanya jika input chat TIDAK focus
  useEffect(() => {
    if (!inputFocus && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, inputFocus]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await axios.post(`${API_URL}/room/${email}/admin`, { message: input });
      setInput("");
      fetchMessages();
    } catch {}
    setSending(false);
  };

  const handleDone = async () => {
    try {
      await axios.patch(`${API_URL}/room/${email}/status`, { status: "done" });
      setStatus("done");
      if (onStatusChange) onStatusChange();
    } catch {}
  };

  return (
    <div className="cs-admin-room-modal">
      <div className="cs-admin-room-box">
        <div className="cs-admin-room-header">
          <b>Chat: {email}</b>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="cs-admin-room-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="cs-admin-room-messages">
                {messages.map((msg) => (
                  <div
                    className={
                      msg.sender === "admin"
                        ? "msg-bubble admin"
                        : "msg-bubble user"
                    }
                    key={msg._id}
                  >
                    <div className="msg-meta">
                      <span>{msg.name}</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="msg-content">{msg.message}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {status === "done" ? (
                <div className="cs-admin-room-closed">
                Chat is finished, can't reply anymore.
                </div>
              ) : (
                <form className="cs-admin-room-input" onSubmit={handleSend}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesan untuk user..."
                    disabled={sending || status === "done"}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                  />
                  <button type="submit" disabled={sending || !input.trim()}>
                    Send
                  </button>
                  <button
                    type="button"
                    className="done-btn"
                    onClick={handleDone}
                  >
                   Mark Complete
                  </button>
                </form>
              )}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default CustomerServiceAdminRoom;
