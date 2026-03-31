import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { auth } from "./firebase";
import GoogleAuth from "./GoogleAuth";
import Home from "./Home";
import AdminPage from "./AdminPage";
import ContactPage from "./ContactPage";
import Header from "./Header";

const AdminRoute = ({ user, children }) => {
  const hasAdminAccess =
    typeof window !== "undefined" &&
    localStorage.getItem("flexinode_admin_access") === "granted";

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = ({ user }) => {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/admin") || location.pathname === "/auth";

  return (
    <div className="app-wrapper">
      {!hideHeader && user && <Header user={user} />}
      
      <main className={`app-main ${hideHeader ? 'no-header' : 'with-header'}`}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <GoogleAuth />} />
          <Route
            path="/"
            element={user ? <Home user={user} /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminPage user={user} />
              </AdminRoute>
            }
          />
          <Route path="/contact" element={user ? <ContactPage /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((person) => {
      if (!person && typeof window !== "undefined") {
        localStorage.removeItem("flexinode_admin_access");
      }

      setUser(person || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="global-loader">
        <div className="spinner"></div>
        <p>Initializing FLEXINODE...</p>
      </div>
    );

  return (
    <Router>
      <AppContent user={user} />
    </Router>
  );
};

export default App;
