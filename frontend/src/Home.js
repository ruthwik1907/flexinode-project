import React, { useRef } from "react";
import "./Home.css";
import StorageSlider from "./StorageSlider";
import HomePage from "./assets/HomePage.jpg";
import DataRestore from "./assets/DataRestore.jpg";
import DataStore from "./assets/DataStore.jpg";
import DataCenter from "./assets/DataCenter.jpg";
import DataDisaster from "./assets/DataDisaster.jpg";

const Home = ({ user }) => {
  const storageRef = useRef(null);
  const scrollToStorage = () => {
    if (storageRef.current) {
      storageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <img src={HomePage} alt="Data Recovery Hero" className="hero-image" />
        <div className="hero-text">
          <h3>FLEXINODE Expert Data Recovery Services</h3>
          <p>
            We provide industry-leading solutions for secure data recovery,
            backup, and disaster management to keep your business running
            without interruption.
          </p>
        </div>
      </section>

      <h1>
        <center>TALES OF DATA</center>
      </h1>

      <main className="home-content">
        <section className="database-section">
          <div className="database-grid">
            {/* Database cards */}
            <div className="database-card">
              <img
                src={DataCenter}
                alt="Database Service 1"
                className="card-img"
              />
              <div className="card-text">
                <strong>Data Center</strong>
                <p>The Core Infrastructure Powering Digital Operations...</p>
              </div>
            </div>
            <div className="database-card">
              <img
                src={DataStore}
                alt="Database Service 2"
                className="card-img"
              />
              <div className="card-text">
                <strong>Data Store</strong>
                <p>
                  Reliable, and quick access to data for modern applications.
                </p>
              </div>
            </div>
            <div className="database-card">
              <img
                src={DataRestore}
                alt="Database Service 3"
                className="card-img"
              />
              <div className="card-text">
                <strong>Data Restore</strong>
                <p>Protecting the digital resources businesses rely on.</p>
              </div>
            </div>
            <div className="database-card">
              <img
                src={DataDisaster}
                alt="Database Service 4"
                className="card-img"
              />
              <div className="card-text">
                <strong>Data Disaster Recovery</strong>
                <p>Ensures business continuity during unexpected failures.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section">
          <h2>OUR SERVICES</h2>

          <div className="services-grid">
            {/* Full-width horizontal image */}
            <div className="service-card full-width" onClick={scrollToStorage}>
              <img src={DataRestore} alt="Service 1" />
              <div className="service-text">
                <strong>Data Storage</strong>
                <p>₹6,000.00</p>
                <strong>Shop Now →</strong>
              </div>
            </div>

            {/* Two half-width images side by side */}
            <div className="half-row">
              <div
                className="service-card half-width"
                onClick={scrollToStorage}
              >
                <img src={DataStore} alt="Service 2" />
                <div className="service-text">
                  <strong>Data Restore</strong>
                  <p> ₹10,000.00</p>
                  <strong>Shop Now →</strong>
                </div>
              </div>

              <div
                className="service-card half-width"
                onClick={scrollToStorage}
              >
                <img src={DataCenter} alt="Service 3" />
                <div className="service-text">
                  <strong>Data disaster recovery</strong>
                  <p> ₹85.00</p>
                  <strong>Shop Now →</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={storageRef}>
          <h2>Storage Selection</h2>
          <StorageSlider uid={user.uid} user={user} />
        </section>
      </main>
    </div>
  );
};

export default Home;
