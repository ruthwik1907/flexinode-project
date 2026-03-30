import React from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa"; 
import "./ContactPage.css";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>
          We value our customers and partners worldwide. Whether you have a
          question, need assistance — we’re here for you!
        </p>
      </div>

      <div className="contact-card">
        <h2>FLEXINODE</h2>
        <p className="address">
          Sai Rushidhar Konireddy, Mullapudi Road, Nallamanikalava, Thanapalle,
          Tirupati, Andhra Pradesh, India
        </p>

        <p className="phone">
          📞 <a href="tel:9347011036">+91 9347011036</a>
        </p>

        <p className="email">
          📧{" "}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=ranjithraju2709@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            ranjithraju2709@gmail.com
          </a>
        </p>

        {/* ✅ WhatsApp contact */}
        <div className="whatsapp">
          <FaWhatsapp className="whatsapp-icon" />
          <a
            href="https://wa.me/919347011036"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>

        <h2>Availability</h2>
        <p>
          We’re available 24/7 serving customers{" "}
          <strong>internationally</strong>.
        </p>
      </div>

      <div className="back-btn-container">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default ContactPage;
