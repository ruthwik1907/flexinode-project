import React, { useRef } from "react";
import "./Home.css";
import StorageSlider from "../components/StorageSlider";
import HomePage from "../assets/HomePage.jpg";
import DataRestore from "../assets/DataRestore.jpg";
import DataStore from "../assets/DataStore.jpg";
import DataCenter from "../assets/DataCenter.jpg";
import DataDisaster from "../assets/DataDisaster.jpg";

const Home = ({ user }) => {
  const storageRef = useRef(null);
  const scrollToStorage = () => {
    if (storageRef.current) {
      storageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background" style={{ backgroundImage: `url(${HomePage})` }}>
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">Enterprise Grade</div>
          <h1 className="hero-title">
            Expert Data <span className="highlight-text">Recovery</span> Services
          </h1>
          <p className="hero-subtitle">
            Industry-leading solutions for secure data recovery, backup, and disaster management. Keep your business running without interruption.
          </p>
          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={scrollToStorage}>Explore Storage Plans</button>
          </div>
        </div>
      </section>

      {/* Main Content Areas */}
      <main className="main-content">
        
        {/* Core Services Grid */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">TALES OF DATA</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card glass-panel group">
              <div className="card-image-wrapper">
                <img src={DataCenter} alt="Data Center" className="card-image" />
              </div>
              <div className="card-content">
                <h3>Data Center</h3>
                <p>The core infrastructure powering your digital operations with absolute reliability.</p>
              </div>
            </div>
            
            <div className="feature-card glass-panel group">
              <div className="card-image-wrapper">
                <img src={DataStore} alt="Data Store" className="card-image" />
              </div>
              <div className="card-content">
                <h3>Data Store</h3>
                <p>Reliable, scalable, and instant access to your mission-critical data.</p>
              </div>
            </div>
            
            <div className="feature-card glass-panel group">
              <div className="card-image-wrapper">
                <img src={DataRestore} alt="Data Restore" className="card-image" />
              </div>
              <div className="card-content">
                <h3>Data Restore</h3>
                <p>Advanced recovery mechanisms protecting the resources you rely on.</p>
              </div>
            </div>
            
            <div className="feature-card glass-panel group">
              <div className="card-image-wrapper">
                <img src={DataDisaster} alt="Disaster Recovery" className="card-image" />
              </div>
              <div className="card-content">
                <h3>Disaster Recovery</h3>
                <p>Ensures 99.99% business continuity during unexpected failures.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Services Area */}
        <section className="premium-services-section">
          <div className="section-header">
            <h2 className="section-title">PREMIUM SERVICES</h2>
            <div className="section-divider"></div>
          </div>

          <div className="services-showcase">
            {/* Main Service */}
            <div className="showcase-main glass-panel" onClick={scrollToStorage}>
              <div className="showcase-bg" style={{ backgroundImage: `url(${DataRestore})` }}></div>
              <div className="showcase-overlay"></div>
              <div className="showcase-info">
                <div className="showcase-badge">Popular</div>
                <h3>Enterprise Data Storage</h3>
                <p className="price">Starting at ₹6,000.00</p>
                <div className="action-link">Select Plan <span className="arrow">→</span></div>
              </div>
            </div>

            {/* Sub Services */}
            <div className="showcase-grid">
              <div className="showcase-item glass-panel" onClick={scrollToStorage}>
                <div className="showcase-bg" style={{ backgroundImage: `url(${DataStore})` }}></div>
                <div className="showcase-overlay"></div>
                <div className="showcase-info">
                  <h3>Advanced Data Restore</h3>
                  <p className="price">₹10,000.00</p>
                  <div className="action-link">Learn More <span className="arrow">→</span></div>
                </div>
              </div>

              <div className="showcase-item glass-panel" onClick={scrollToStorage}>
                <div className="showcase-bg" style={{ backgroundImage: `url(${DataCenter})` }}></div>
                <div className="showcase-overlay"></div>
                <div className="showcase-info">
                  <h3>Disaster Recovery Audit</h3>
                  <p className="price">₹85.00 / node</p>
                  <div className="action-link">Start Audit <span className="arrow">→</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Storage Slider Section */}
        <section ref={storageRef} className="pricing-section">
          <div className="section-header center">
            <h2 className="section-title">Configure Your Storage</h2>
            <p className="section-subtitle">Use the slider below to select your required capacity.</p>
          </div>
          
          <div className="slider-wrapper glass-panel">
            <StorageSlider uid={user.uid} user={user} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
