import React from "react";
import { useNavigate } from "react-router-dom";
import "./ContactPage.css";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-page animate-fade-in">
      <div className="contact-hero">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-subtitle">
          We value our customers and partners worldwide. Whether you have a question, need assistance — we're here for you 24/7.
        </p>
      </div>

      <div className="contact-cards-container">
        <div className="contact-detail-card glass-panel group">
           <div className="icon-wrapper">📍</div>
           <h3>Headquarters</h3>
           <p className="contact-info">
              Sai Rushidhar Konireddy, Mullapudi Road, Nallamanikalava, Thanapalle, Tirupati, Andhra Pradesh, India
           </p>
        </div>

        <div className="contact-detail-card glass-panel group">
           <div className="icon-wrapper">📞</div>
           <h3>Phone Support</h3>
           <p className="contact-info">
             <a href="tel:8886347428" className="contact-link">+91 8886347428</a>
           </p>
           <p className="hint">Available 24/7 Mon-Sun</p>
        </div>

        <div className="contact-detail-card glass-panel group">
           <div className="icon-wrapper">✉️</div>
           <h3>Email Us</h3>
           <p className="contact-info">
             <a href="mailto:flexinode@gmail.com" className="contact-link">flexinode@gmail.com</a>
           </p>
           <p className="hint">Average response time: 2 hours</p>
        </div>
      </div>

      <div className="contact-footer">
        <button className="btn-secondary back-btn" onClick={() => navigate("/")}>
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ContactPage;
