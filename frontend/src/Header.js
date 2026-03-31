import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import { buildApiUrl } from "./services";
import logo from "./assets/fnlogo.jpg";
import "./Header.css";

const Header = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isNavOpen) {
        setIsNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);
  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const signOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminTap = () => {
    setShowPasswordModal(true);
    setPassword("");
    setError("");
    setIsNavOpen(false);
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/admin-login"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        localStorage.setItem("flexinode_admin_access", "granted");
        localStorage.setItem("flexinode_admin_password", data.token || password);
        setShowPasswordModal(false);
        setPassword("");
        setError("");
        navigate("/admin");
      } else {
        setError(`❌ ${data.error || "Incorrect password!"}`);
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Unable to reach the server. Please check your connection.");
    }
  };

  const getInitials = () => {
    const name = user?.displayName || user?.email || "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <>
      <header className={`main-header ${isScrolled ? "scrolled glass-panel" : ""}`}>
        <div className="header-content">
          <Link to="/" className="brand-link">
            <img src={logo} alt="Flexinode Logo" className="brand-logo" />
            <span className="brand-name">FLEXINODE</span>
          </Link>

          <button className="mobile-menu-btn" onClick={toggleNav}>
            <div className={`hamburger ${isNavOpen ? "open" : ""}`}>
              <span></span><span></span><span></span>
            </div>
          </button>

          <nav className={`main-nav ${isNavOpen ? "open glass-panel" : ""}`}>
            <Link to="/" className="nav-link" onClick={() => setIsNavOpen(false)}>Home</Link>
            <button onClick={handleAdminTap} className="nav-link nav-link-btn">Admin Portal</button>
            <Link to="/contact" className="nav-link" onClick={() => setIsNavOpen(false)}>Contact</Link>
            
            <div className="user-profile-widget" onClick={toggleDropdown}>
              <div className="avatar">{getInitials()}</div>
              {dropdownOpen && (
                <div className="profile-dropdown glass-panel animate-fade-in">
                  <div className="profile-info">
                    <p className="profile-name">{user?.displayName || "User"}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                  <button className="logout-action" onClick={signOut}>Sign Out</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2>Admin Authentication</h2>
            <p>Please enter your credentials to access the portal.</p>
            <div className="input-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="modern-input"
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handlePasswordSubmit}>Authenticate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;