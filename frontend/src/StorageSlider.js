import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { API_BASE } from "./services";
import "./StorageSlider.css";

const StorageSlider = ({ uid, user }) => {
  const [value, setValue] = useState(1);
  const [upiNumber, setUpiNumber] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const pricePerGB = 1000;
  const gbPerStep = 1;

  const totalGB = value * gbPerStep;
  const totalPrice = totalGB * pricePerGB;

  const upiId = "vrraju27@ybl";
  const payeeName = "V Ranjith Raju";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${totalPrice}&cu=INR`;

  const isUpiNumberValid = upiNumber.length === 10 && /^\d+$/.test(upiNumber);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
    setShowQRCode(false); // Hide QR code when slider changes
    setPaymentId("");
    setPaymentStatus("");
  };

  const handlePay = async () => {
    if (!user) return alert("Login required!");

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // 1️⃣ Call backend to save payment
      const response = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          name: user.displayName,
          email: user.email,
          gb: totalGB,
          totalPrice,
          upiLink: upiUrl,
          upiNumber,
          deviceType: isMobile ? "mobile" : "desktop",
        }),
      });

      const data = await response.json();
      console.log("Payment processed:", data);
      setPaymentId(data?.payment?._id || "");
      setPaymentStatus(data?.payment?.status || "PENDING");

      if (isMobile) {
        window.location.href = upiUrl;
      } else {
        setShowQRCode(true); // show QR code for desktop
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed. Try again.");
    }
  };

  const handleDebugDone = async () => {
    if (!paymentId) {
      alert("No payment record found to mark as paid.");
      return;
    }

    try {
      setIsMarkingPaid(true);

      const response = await fetch(`${API_BASE}/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to mark payment as paid.");
      }

      setPaymentStatus(data?.status || "PAID");
      alert("Payment marked as PAID for debugging.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update payment status.");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return (
    <div className="payment-dialog-container">
      <div className="slider-section">
        <h2 className="section-title">Choose Storage</h2>
        <div className="slider-content">
          <input
            type="range"
            min="1"
            max="100"
            value={value}
            onChange={handleChange}
            className="styled-slider"
          />
          <div className="details-row">
            <p>
              Selected: <strong>{value} GB</strong>
            </p>
            <p>
              Price: <strong>₹{totalPrice}</strong>
            </p>
          </div>
        </div>
        <div className="upi-input-container">
          <p className="label">Your UPI Mobile Number</p>
          <input
            type="tel"
            placeholder="e.g., 9876543210"
            value={upiNumber}
            onChange={(e) => setUpiNumber(e.target.value)}
            className="upi-input"
            maxLength="10"
          />
        </div>
      </div>

      <div className="payment-section">
        <h2 className="section-title">Complete Payment</h2>
        <div className="qr-code-container">
          {showQRCode ? (
            <>
              <p>Scan with any UPI app (for Desktop/Laptop)</p>
              <div className="qr-code-box">
                <QRCodeSVG value={upiUrl} size={150} />
              </div>
              <div className="upi-info">
                <p>
                  <strong>Total: ₹{totalPrice}</strong>
                </p>
                <p>
                  Pay to: <strong>{payeeName}</strong>
                </p>
                {paymentStatus && (
                  <p className="payment-status">
                    Status: <strong>{paymentStatus}</strong>
                  </p>
                )}
              </div>
              {paymentId && paymentStatus !== "PAID" && (
                <button
                  className="done-btn"
                  onClick={handleDebugDone}
                  disabled={isMarkingPaid}
                >
                  {isMarkingPaid ? "Marking..." : "Done"}
                </button>
              )}
              {paymentStatus === "PAID" && (
                <p className="debug-success">Payment marked as paid.</p>
              )}
            </>
          ) : (
            <div className="pay-button-container">
              <p>
                {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                  ? "Tap below to open your UPI app"
                  : "Generate QR code to pay with your UPI app"}
              </p>
              <button
                className="pay-btn"
                onClick={handlePay}
                disabled={!isUpiNumberValid}
              >
                Pay ₹{totalPrice} via UPI
              </button>
              {paymentId && paymentStatus !== "PAID" && (
                <button
                  className="done-btn"
                  onClick={handleDebugDone}
                  disabled={isMarkingPaid}
                >
                  {isMarkingPaid ? "Marking..." : "Done"}
                </button>
              )}
              {paymentStatus && (
                <p className="payment-status">
                  Status: <strong>{paymentStatus}</strong>
                </p>
              )}
              {paymentStatus === "PAID" && (
                <p className="debug-success">Payment marked as paid.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageSlider;
//all my changes the pushed to git main
