import React, { useEffect, useState } from "react";
import { auth, googleProvider } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/services";
import logo from "../assets/fnlogo.jpg";
import "./GoogleAuth.css";

const GoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((person) => {
      setUser(person || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("User synced with DB"))
        .catch((err) => console.error("Sync error:", err));
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      setError("");
      setIsLoading(true);
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await auth.signInWithPopup(googleProvider);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-portal animate-fade-in">
      <div className="auth-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>

      <div className="auth-card glass-panel">
        <div className="brand-header">
          <img src={logo} alt="Flexinode Logo" className="auth-logo" />
          <h1>FLEXINODE</h1>
        </div>

        {user ? (
          <div className="auth-profile">
            <div className="auth-avatar lg">
              {user.displayName?.slice(0, 2).toUpperCase() || "?"}
            </div>
            <h2>Welcome Back!</h2>
            <p className="user-email">{user.email}</p>
            <div className="auth-actions">
              <button className="btn-primary w-full" onClick={() => navigate("/")}>
                Go to Dashboard
              </button>
              <button className="btn-secondary w-full" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-login-flow">
            <h2>Sign In to Portal</h2>
            <p className="auth-subtitle">
              Secure access to your enterprise data management solutions.
            </p>
            
            {error && <div className="toast toast-error">{error}</div>}
            
            <button 
              className={`google-sso-btn ${isLoading ? 'loading' : ''}`} 
              onClick={signInWithGoogle}
              disabled={isLoading}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                alt="Google"
                className="google-icon"
              />
              <span>{isLoading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>

            <div className="auth-footer">
              <p>By signing in, you agree to our Terms of Service & Privacy Policy.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuth;
