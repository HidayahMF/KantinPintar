import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { url, fetchFoodList } = useContext(StoreContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("verifying"); // verifying | success | failed

  useEffect(() => {
    let isMounted = true;

    const verifyPayment = async () => {
      // DEBUG: log sessionId
      console.log("[DEBUG] sessionId dari URL:", sessionId);

      if (!sessionId) {
        setError("No session ID found in URL.");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        // DEBUG: log request URL
        const verifyUrl = `${url}/api/order/verify?session_id=${encodeURIComponent(sessionId)}`;
        console.log("[DEBUG] Request ke:", verifyUrl);

        // Gunakan fetch agar lebih mudah debug network problem
        const response = await fetch(verifyUrl);
        const data = await response.json();
        console.log("[DEBUG] Response backend:", data);

        if (data.success) {
          setStatus("success");
          await fetchFoodList(); // refresh stock
          setTimeout(() => navigate("/myorder"), 600);
        } else {
          setStatus("failed");
          setError("Verification failed: " + (data.message || "-"));
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        setStatus("failed");
        setError("Error verifying payment: " + err.message);
        setTimeout(() => navigate("/"), 2000);
      }
    };

    if (isMounted) verifyPayment();
    return () => { isMounted = false; };
  }, [sessionId, url, fetchFoodList, navigate]);

  return (
    <div className="verify">
      <div className="spinner">
        <div className="spinner-circle"></div>
        {status === "verifying" && "Verifying payment..."}
        {status === "success" && <span style={{ color: "green" }}>Success! Redirecting...</span>}
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>
    </div>
  );
};

export default Verify;
