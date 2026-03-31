import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "./services";
import "./AdminPage.css";

const AdminPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, payments
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    // Relying on localStorage set during login
    const password = localStorage.getItem("flexinode_admin_password") || "";
    return {
      "Authorization": `Bearer ${password}`,
      "Content-Type": "application/json"
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders();
      
      const [usersRes, paymentsRes, statsRes] = await Promise.all([
        fetch(buildApiUrl("/users"), { headers }),
        fetch(buildApiUrl("/payments"), { headers }),
        fetch(buildApiUrl("/stats"), { headers })
      ]);

      if (!usersRes.ok || !paymentsRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch admin data. Check your admin access token.");
      }

      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setStats(statsData);
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePaymentStatusUpdate = async (paymentId, newStatus) => {
    try {
      const res = await fetch(buildApiUrl(`/payments/${paymentId}`), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      showToast("Payment status updated successfully!");
      fetchDashboardData(); // Refetch to update all charts
    } catch (err) {
      showToast("Error updating status.", true);
    }
  };

  const showToast = (msg, isError = false) => {
    setActionMessage({ text: msg, isError });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("flexinode_admin_access");
    localStorage.removeItem("flexinode_admin_password");
    navigate("/");
  };

  if (loading && !stats) return (
    <div className="admin-loading">
      <div className="spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="admin-layout animate-fade-in">
      {/* Sidebar Nav */}
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <h2>FLEXINODE <span className="badge">ADMIN</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={`nav-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>Users System</button>
          <button className={`nav-btn ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>Payments</button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-secondary logout-btn" onClick={handleLogout}>Exit Dashboard</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
          {actionMessage && (
            <div className={`toast ${actionMessage.isError ? "toast-error" : "toast-success"}`}>
              {actionMessage.text}
            </div>
          )}
        </header>

        {error && (
          <div className="error-box glass-panel">
            <p><strong>Error:</strong> {error}</p>
            <button className="btn-primary" onClick={fetchDashboardData}>Retry API Call</button>
          </div>
        )}

        <div className="admin-content-area">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && stats && !error && (
            <div className="dashboard-grid">
              <div className="stat-card glass-panel">
                <h3>Total Revenue</h3>
                <p className="stat-value text-success">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Total Registered Users</h3>
                <p className="stat-value text-brand">{stats.totalUsers}</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Data Distributed</h3>
                <p className="stat-value text-brand">{stats.totalStorageGB} GB</p>
              </div>
              <div className="stat-card glass-panel">
                <h3>Pending Activation</h3>
                <p className="stat-value text-warning">{stats.pendingPayments} Orders</p>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && !error && (
            <div className="table-container glass-panel">
              {users.length === 0 ? <p className="empty-state">No users recorded yet.</p> : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>UID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Allocated Storage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.uid}>
                        <td className="mono">{u.uid}</td>
                        <td>{u.name || "N/A"}</td>
                        <td>{u.email}</td>
                        <td><span className="badge badge-blue">{u.storageGB} GB</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && !error && (
            <div className="table-container glass-panel">
              {payments.length === 0 ? <p className="empty-state">No payments recorded yet.</p> : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User ID</th>
                      <th>Plan (GB)</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id}>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="mono" title={p.userId}>{p.userId.substring(0, 8)}...</td>
                        <td>{p.gb} GB</td>
                        <td>₹{p.totalPrice}</td>
                        <td>
                          <span className={`badge badge-${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <select 
                            className="status-dropdown" 
                            defaultValue={p.status}
                            onChange={(e) => handlePaymentStatusUpdate(p._id, e.target.value)}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
