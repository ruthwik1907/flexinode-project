import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;

  return (
    <Router>
      {user && <Header user={user} />}
      <Routes>
        <Route path="/auth" element={<GoogleAuth />} />
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
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
};

export default App;
