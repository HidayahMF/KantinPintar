import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContextProvider";
import "./CustomerServiceRoom.css";

const API_URL = "http://localhost:4000/api/message";

const CustomerServiceRoom = () => {
  const { user } = useContext(StoreContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("open");
  const [cooldown, setCooldown] = useState(0);

  const chatEndRef = useRef(null);
  const [inputFocus, setInputFocus] = useState(false);

  const email = user?.email;

  const fetchMessages = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/room/${email}`);
      if (res.data.success) setMessages(res.data.data);
    } catch {}
    setLoading(false);
  };

  const fetchStatus = async () => {
    if (!email) return;
    try {
      const res = await axios.get(`${API_URL}/room/${email}/status`);
      setStatus(res.data.status);

   
      if (res.data.status === "done") {
        const resMsgs = await axios.get(`${API_URL}/room/${email}`);
        const lastUserMsg = (resMsgs.data.data || [])
          .filter((msg) => msg.sender === "user")
          .pop();
        if (lastUserMsg) {
          const diffMs = new Date() - new Date(lastUserMsg.createdAt);
          const diffMin = 10 - Math.floor(diffMs / 1000 / 60);
          setCooldown(diffMin > 0 ? diffMin : 0);
        }
      } else {
        setCooldown(0);
      }
    } catch {}
  };


  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!inputFocus) {
        await fetchMessages();
        await fetchStatus();
      }
      timer = setTimeout(poll, 10000); 
    };
    poll();
    return () => clearTimeout(timer);
    
  }, [email, inputFocus]);


  useEffect(() => {
    if (!inputFocus && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, inputFocus]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !email) return;
    try {
      await axios.post(`${API_URL}/room/${email}/user`, {
        name: user.name,
        message: input,
      });
      setInput("");
      fetchMessages();
      fetchStatus();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Gagal mengirim pesan. Silakan coba lagi."
      );
    }
  };

  return (
    <div className="cs-user-room">
      <div className="cs-user-room-box">
        <div className="cs-user-room-header">Customer Service</div>
        <div className="cs-user-room-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="cs-user-room-messages">
                {messages.map((msg) => (
                  <div
                    className={
                      msg.sender === "user"
                        ? "msg-bubble user"
                        : "msg-bubble admin"
                    }
                    key={msg._id}
                  >
                    <div className="msg-meta">
                      <span>
                        {msg.sender === "user" ? "Anda" : "Admin"}
                      </span>
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
                <div className="cs-user-room-closed">
                 Chat has been completed by admin.<br />
                  {cooldown > 0
                    ? `Anda bisa kirim pesan baru dalam ${cooldown} menit lagi.`
                    : "Silakan reload untuk memulai chat baru."}
                </div>
              ) : (
                <form className="cs-user-room-input" onSubmit={handleSend}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ketik pesan ke admin..."
                    disabled={status === "done"}
                    onFocus={() => setInputFocus(true)}
                    onBlur={() => setInputFocus(false)}
                  />
                  <button type="submit" disabled={!input.trim()}>
                   Send
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

export default CustomerServiceRoom;
