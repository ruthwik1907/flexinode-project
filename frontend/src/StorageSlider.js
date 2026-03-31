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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pricePerGB = 1000;
  const gbPerStep = 1;

  const totalGB = value * gbPerStep;
  const totalPrice = totalGB * pricePerGB;

  const upiId = "sairushidharkonireddy@ybl";
  const payeeName = "Kone ReddySreenivasaSai Rushidhar";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    payeeName
  )}&am=${totalPrice}&cu=INR`;

  const isUpiNumberValid = upiNumber.length === 10 && /^\d+$/.test(upiNumber);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
    setShowQRCode(false);
    setPaymentId("");
    setPaymentStatus("");
    setErrorMsg("");
  };

  const handlePay = async () => {
    if (!user) {
      setErrorMsg("Please sign in to continue with your purchase.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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
      
      if (!response.ok) {
        throw new Error(data.error || "Payment creation failed");
      }

      setPaymentId(data?.payment?._id || "");
      setPaymentStatus(data?.payment?.status || "PENDING");

      if (isMobile) {
        window.location.href = upiUrl;
      } else {
        setShowQRCode(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="payment-dialog-container animate-fade-in">
      {/* Configure Section */}
      <div className="configure-section">
        <h3>1. Select Capacity</h3>
        
        <div className="slider-control-group">
          <div className="slider-header">
            <span className="slider-label">Storage Amount</span>
            <span className="slider-value badge">{value} GB</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="100"
            value={value}
            onChange={handleChange}
            className="modern-range"
            style={{ '--progress': `${((value - 1) / 99) * 100}%` }}
          />
          <div className="slider-marks">
            <span>1GB</span>
            <span>100GB</span>
          </div>
        </div>

        <div className="upi-input-group mt-6">
          <label htmlFor="upi-phone">2. Enter your UPI Mobile Number</label>
          <input
            id="upi-phone"
            type="tel"
            placeholder="e.g. 9876543210"
            value={upiNumber}
            onChange={(e) => setUpiNumber(e.target.value)}
            className="modern-input"
            maxLength="10"
          />
          {!isUpiNumberValid && upiNumber.length > 0 && (
            <span className="input-hint text-warning">Must be a valid 10-digit number</span>
          )}
        </div>
      </div>

      {/* Summary & Checkout Section */}
      <div className="checkout-section">
        <h3>Order Summary</h3>
        
        <div className="summary-card">
          <div className="summary-row">
            <span>Enterprise Storage</span>
            <span>{value} GB</span>
          </div>
          <div className="summary-row">
            <span>Price per GB</span>
            <span>₹{pricePerGB}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total Payable</span>
            <span className="total-price text-brand">₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {errorMsg && <div className="toast toast-error mt-4">{errorMsg}</div>}

        <div className="payment-actions mt-6">
          {showQRCode ? (
            <div className="qr-checkout animate-fade-in">
              <p className="qr-instruction">Scan with any UPI App to Pay</p>
              <div className="qr-box">
                <QRCodeSVG value={upiUrl} size={160} fgColor="var(--bg-primary)" />
              </div>
              <p className="payee-info">Paying: <strong>{payeeName}</strong></p>
              
              <div className="status-tracker">
                <div className="status-indicator pending"></div>
                <span>Awaiting Payment...</span>
              </div>
              <p className="status-subtext">Order #{paymentId.slice(-6).toUpperCase()}</p>
            </div>
          ) : (
            <button
              className={`btn-primary w-full checkout-btn ${isLoading ? 'loading' : ''}`}
              onClick={handlePay}
              disabled={!isUpiNumberValid || isLoading}
            >
              {isLoading ? 'Processing...' : `Proceed to Pay ₹${totalPrice.toLocaleString()}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorageSlider;
