import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Globe,
  BarChart3,
  Settings,
  LogOut,
  User,
  Mail,
  Lock,
  Calendar,
  Check,
  Shield,
  Loader2,
  Key,
} from "lucide-react";
import { logout, getUrls } from "../api/api";
import "./SettingsPage.css";
import "./Dashboard.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [firstUrlId, setFirstUrlId] = useState(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch URLs to get the first link ID for the Analytics tab link
    const fetchFirstUrl = async () => {
      try {
        const result = await getUrls(1, 1);
        if (result.urls && result.urls.length > 0) {
          setFirstUrlId(result.urls[0]._id);
        }
      } catch (err) {
        console.error("Failed to load URLs for settings header", err);
      }
    };
    fetchFirstUrl();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Basic frontend verification
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccess("Password successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="settings-page-container">
      {/* Global Header */}
      <header className="dashboard-header" style={{ marginBottom: "30px" }}>
        <div className="brand-wrapper">
          <img
            src="/logo.png"
            className="brand-logo-img"
            alt="SnapLink Logo"
            style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }}
          />
          <div className="brand-logo">SNAPLINK</div>
        </div>

        {/* Navigation pill in the middle */}
        <nav className="header-navigation">
          <Link to="/" className="nav-item">
            <Globe size={16} />
            <span>Dashboard</span>
          </Link>
          {firstUrlId ? (
            <Link to={`/analytics/${firstUrlId}`} className="nav-item">
              <BarChart3 size={16} />
              <span>Analytics</span>
            </Link>
          ) : (
            <button
              className="nav-item disabled-nav"
              title="Select a link below to view its analytics"
              style={{ cursor: "not-allowed" }}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
          )}
          <button className="nav-item active">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Elegant User Profile in Top Right Header */}
        <div className="user-profile-container">
          <span className="welcome-text-new">
            <span className="user-status-dot"></span>
            Welcome, <strong className="profile-name-new">{user.username}</strong>
          </span>
          <button onClick={handleLogout} className="logout-btn-capsule" title="Log Out">
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="settings-main-layout">
        <h2 className="settings-section-title">Account Settings</h2>

        <div className="settings-grid-layout">
          {/* Profile Details Card */}
          <section className="settings-card glass-panel animate-fade-in">
            <h3 className="card-title">
              <User size={18} className="text-gradient" /> Profile Information
            </h3>
            <p className="card-subtitle">Your registered account details</p>

            <div className="profile-details-list">
              <div className="profile-detail-item">
                <div className="detail-icon">
                  <User size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Username</span>
                  <span className="detail-val">{user.username || "N/A"}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="detail-icon">
                  <Mail size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-val">{user.email || "N/A"}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="detail-icon">
                  <Shield size={16} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Account Tier</span>
                  <span className="detail-val premium-tier-badge">Premium Access</span>
                </div>
              </div>

              {user.createdAt && (
                <div className="profile-detail-item">
                  <div className="detail-icon">
                    <Calendar size={16} />
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-val">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Change Password Card */}
          <section className="settings-card glass-panel animate-fade-in">
            <h3 className="card-title">
              <Key size={18} className="text-gradient" /> Security & Password
            </h3>
            <p className="card-subtitle">Update your credentials regularly</p>

            {success && <div className="settings-success-alert">{success}</div>}
            {error && <div className="settings-error-alert">{error}</div>}

            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="settings-form-group">
                <label className="settings-form-label">Current Password</label>
                <div className="settings-input-wrapper">
                  <Lock className="settings-input-icon" />
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">New Password</label>
                <div className="settings-input-wrapper">
                  <Lock className="settings-input-icon" />
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Confirm New Password</label>
                <div className="settings-input-wrapper">
                  <Lock className="settings-input-icon" />
                  <input
                    type="password"
                    className="settings-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="settings-save-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Updating...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Update Password
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
