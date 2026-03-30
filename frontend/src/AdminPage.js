import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "./services";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError("");
        const res = await fetch(buildApiUrl("/users"));
        const data = await res.json().catch(() => []);

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch users");
        }

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load admin data. Check whether the Render backend is live and your frontend domain is allowed in CORS."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Loading users...</p>
    );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <h2>All Logged-in Users</h2>
      </div>

      {error ? (
        <p className="no-users">{error}</p>
      ) : users.length === 0 ? (
        <p className="no-users">No users found.</p>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>UID</th>
                <th>Storage (GB)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>{user.uid}</td>
                  <td>{user.storageGB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="back-btn-container">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
