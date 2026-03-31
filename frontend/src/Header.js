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
  const navigate = useNavigate();

  // Close nav menu if window is resized above mobile breakpoint (768px)
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
      // Corrected to use the standard buildApiUrl helper
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
        setShowPasswordModal(false);
        setPassword("");
        setError("");
        navigate("/admin");
      } else {
        setError(`❌ ${data.error || "Incorrect password!"}`);
      }
    } catch (err) {
      console.error(err);
      setError(
        "⚠️ Unable to reach the server. Please check your connection or Vercel deployment status."
      );
    }
  };

  const getInitials = () => {
    const name = user.displayName || user.email;
    if (!name) return "?";
    
    const names = name.split(" ");
    if (names.length > 1) {
      return (names[0]?.[0] || "").toUpperCase() + (names[names.length - 1]?.[0] || "").toUpperCase();
    }
    return (name[0] || "").toUpperCase();
  };

  return (
    <>
      <header className="home-header">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="App Logo" className="logo" />
          </Link>
        </div>

        <div className="right-section">
          <nav className={`nav-links ${isNavOpen ? 'open' : ''}`}>
            <Link to="/" className="nav-btn" onClick={() => setIsNavOpen(false)}>
              Home
            </Link>
            <button onClick={handleAdminTap} className="nav-btn">
              Admin
            </button>
            <Link to="/contact" className="nav-btn" onClick={() => setIsNavOpen(false)}>
              Contact Us
            </Link>
          </nav>

          <button className="menu-icon" onClick={toggleNav} aria-label="Toggle navigation menu">
            <svg className="hamburger-svg" viewBox="0 0 100 80" width="40" height="40" fill="currentColor">
              <rect width="100" height="15" rx="8"></rect>
              <rect y="30" width="100" height="15" rx="8"></rect>
              <rect y="60" width="100" height="15" rx="8"></rect>
            </svg>
          </button>
          
          <div className="user-info">
            <span className="user-name">{user.displayName || user.email}</span>
            <div className="avatar-container">
              <div className="generic-avatar" onClick={toggleDropdown}>
                {getInitials()}
              </div>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-row">
                    <span className="dropdown-item" onClick={signOut}>
                      Sign out
                    </span>
                    <span className="close-btn" onClick={closeDropdown}>
                      &times;
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>🔒 Admin Access</h2>
            <p>Please enter the admin password to continue:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            {error && <p className="error-text">{error}</p>}
            <div className="modal-actions">
              <button
                className="modal-btn confirm"
                onClick={handlePasswordSubmit}
              >
                Submit
              </button>
              <button
                className="modal-btn cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;