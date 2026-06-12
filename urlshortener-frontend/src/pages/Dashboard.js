import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Link2,
  Copy,
  QrCode,
  BarChart3,
  Trash2,
  LogOut,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  Check,
  Globe,
  MousePointerClick,
  Activity,
  X,
  Download,
  Pencil,
  Search,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  getUrls,
  createUrl,
  deleteUrl,
  updateUrl,
  getDashboardSummary,
  getUrlAnalytics,
  logout,
} from "../api/api";
import "./Dashboard.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Dashboard = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  
  // Data states
  const [urls, setUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Stats states
  const [summary, setSummary] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [shortening, setShortening] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  
  // QR Modal state
  const [qrModalUrl, setQrModalUrl] = useState(null);
  const [qrModalCode, setQrModalCode] = useState("");

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUrlId, setEditUrlId] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Rebranding & interactive states
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUrlId, setExpandedUrlId] = useState(null);
  const [inlineAnalytics, setInlineAnalytics] = useState({});
  const [inlineLoading, setInlineLoading] = useState(false);
  const [liveActivities, setLiveActivities] = useState([
    { id: 1, type: "click", location: "Mumbai, India", device: "Mobile", browser: "Chrome", time: "Just now", target: "portfolio" },
    { id: 2, type: "redirect", location: "New York, USA", device: "Desktop", browser: "Safari", time: "1 min ago", target: "github" },
    { id: 3, type: "click", location: "London, UK", device: "Tablet", browser: "Firefox", time: "3 mins ago", target: "resume" },
  ]);

  useEffect(() => {
    const locations = ["New York, USA", "London, UK", "Mumbai, India", "Tokyo, Japan", "Paris, France", "Sydney, Australia", "Berlin, Germany"];
    const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
    const devices = ["Mobile", "Desktop", "Tablet"];
    const targets = ["promo", "docs", "app", "blog", "portfolio", "social"];
    
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: Math.random() > 0.35 ? "click" : "redirect",
        location: locations[Math.floor(Math.random() * locations.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        time: "Just now",
      };
      setLiveActivities(prev => {
        const updated = [newActivity, ...prev.map(act => ({
          ...act, 
          time: act.time === "Just now" ? "1 min ago" : act.time.includes("min") ? `${parseInt(act.time) + 1} mins ago` : act.time
        }))];
        return updated.slice(0, 4); // Keep last 4
      });
    }, 12000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleExpand = async (urlId) => {
    if (expandedUrlId === urlId) {
      setExpandedUrlId(null);
      return;
    }

    setExpandedUrlId(urlId);

    if (!inlineAnalytics[urlId]) {
      setInlineLoading(true);
      try {
        const result = await getUrlAnalytics(urlId);
        setInlineAnalytics(prev => ({
          ...prev,
          [urlId]: result.analytics
        }));
      } catch (err) {
        console.error("Failed to load inline analytics", err);
      } finally {
        setInlineLoading(false);
      }
    }
  };

  const fetchDashboardData = async (page = 1) => {
    try {
      const urlsData = await getUrls(page, 10);
      setUrls(urlsData.urls);
      setCurrentPage(urlsData.currentPage);
      setTotalPages(urlsData.totalPages);

      const summaryData = await getDashboardSummary();
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(1);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    setFormError("");
    setShortening(true);

    try {
      await createUrl({
        originalUrl,
        customAlias: customAlias || undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      });

      // Clear input form
      setOriginalUrl("");
      setCustomAlias("");
      setExpiryDate("");
      setShowOptions(false);

      // Refresh list
      await fetchDashboardData(1);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Error shortening URL. Try again."
      );
    } finally {
      setShortening(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shortened URL?")) {
      try {
        await deleteUrl(id);
        await fetchDashboardData(currentPage);
      } catch (err) {
        setError("Failed to delete URL.");
      }
    }
  };

  const handleCopy = (id, shortCode) => {
    const fullShortUrl = `${BACKEND_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // QR Modal
  const openQrModal = (shortCode) => {
    const fullShortUrl = `${BACKEND_URL}/${shortCode}`;
    setQrModalUrl(fullShortUrl);
    setQrModalCode(shortCode);
  };

  const closeQrModal = () => {
    setQrModalUrl(null);
    setQrModalCode("");
  };

  const downloadQrCode = () => {
    const svgElement = document.getElementById("qr-code-svg");
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, 256, 256);
      
      const pngURL = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngURL;
      downloadLink.download = `qrcode_${qrModalCode}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    image.src = blobURL;
  };

  // Edit Modal
  const openEditModal = (url) => {
    setEditUrlId(url._id);
    setEditOriginalUrl(url.originalUrl);
    setEditError("");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUrlId(null);
    setEditOriginalUrl("");
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      if (!editOriginalUrl) {
        throw new Error("Please enter a URL.");
      }

      await updateUrl(editUrlId, { originalUrl: editOriginalUrl });
      closeEditModal();
      await fetchDashboardData(currentPage);
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.message || "Failed to update URL."
      );
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <Loader2 className="animate-spin" size={48} color="#6366f1" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand-wrapper">
          <div className="brand-logo">SNAPLINK</div>
        </div>
        <div className="user-profile">
          <span className="welcome-text">
            Welcome, <span className="welcome-name">{user.username}</span>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-content">
            <span className="stat-label">Total Links</span>
            <span className="stat-value">{summary.totalUrls}</span>
          </div>
          <div className="stat-icon-wrapper purple">
            <Globe size={24} />
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-content">
            <span className="stat-label">Total Redirects</span>
            <span className="stat-value">{summary.totalClicks}</span>
          </div>
          <div className="stat-icon-wrapper cyan">
            <MousePointerClick size={24} />
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-content">
            <span className="stat-label">Active Links</span>
            <span className="stat-value">{summary.activeUrls}</span>
          </div>
          <div className="stat-icon-wrapper green">
            <Activity size={24} />
          </div>
        </div>
      </section>

      {/* Shortener Container */}
      {/* Dashboard Layout Grid */}
      <div className="dashboard-layout-grid">
        {/* Left Column: Shortener and URL list */}
        <div className="dashboard-main-col">
          {/* Shortener Container */}
          <section className="shortener-section glass-panel">
            <h2 className="section-title">Shorten a New Link</h2>
            
            {formError && <div className="auth-error" style={{ marginBottom: "20px" }}>{formError}</div>}
            
            <form onSubmit={handleShorten} className="shortener-form">
              <div className="input-main-group">
                <div className="input-main-wrapper">
                  <Link2 className="input-main-icon" />
                  <input
                    type="url"
                    className="input-main"
                    placeholder="Paste your long destination URL here (e.g. https://google.com)..."
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    disabled={shortening}
                  />
                </div>
                <button type="submit" className="shorten-btn" disabled={shortening || !originalUrl}>
                  {shortening ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Shorten
                    </>
                  )}
                </button>
              </div>

              {/* Options Collapsible */}
              <button
                type="button"
                className="options-trigger"
                onClick={() => setShowOptions(!showOptions)}
              >
                {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
                Advanced Options (Custom Alias, Expiry)
              </button>

              {showOptions && (
                <div className="collapsible-options">
                  <div className="option-group">
                    <label className="option-label">Custom Alias (Optional)</label>
                    <input
                      type="text"
                      className="option-input"
                      placeholder="e.g. portfolio-2026"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      disabled={shortening}
                    />
                  </div>

                  <div className="option-group">
                    <label className="option-label">Link Expiry Date (Optional)</label>
                    <input
                      type="datetime-local"
                      className="option-input"
                      value={expiryDate}
                      min={new Date().toISOString().substring(0, 16)}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      disabled={shortening}
                    />
                  </div>
                </div>
              )}
            </form>
          </section>

          {/* URL List */}
          <section className="urls-section glass-panel">
            <div className="urls-header-row">
              <h2 className="section-title">Your Shortened Links</h2>
              <div className="search-bar-wrapper">
                <Search className="search-icon" size={16} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="auth-error" style={{ marginBottom: "20px" }}>{error}</div>}

            {urls.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                No links shortened yet. Shorten your first URL above!
              </div>
            ) : (
              <>
                <div className="urls-table-container">
                  <table className="urls-table">
                    <thead>
                      <tr>
                        <th>Original Destination</th>
                        <th>Short URL</th>
                        <th>Created Date</th>
                        <th>Clicks</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urls
                        .filter((url) => {
                          const query = searchQuery.toLowerCase();
                          return (
                            url.originalUrl.toLowerCase().includes(query) ||
                            url.shortCode.toLowerCase().includes(query) ||
                            (url.customAlias && url.customAlias.toLowerCase().includes(query))
                          );
                        })
                        .map((url) => {
                          const isExpired = url.expiryDate && new Date(url.expiryDate) < new Date();
                          const isExpanded = expandedUrlId === url._id;
                          return (
                            <React.Fragment key={url._id}>
                              <tr 
                                className={`url-row ${isExpanded ? "active-row" : ""}`}
                                onClick={() => handleToggleExpand(url._id)}
                                style={{ cursor: "pointer" }}
                              >
                                <td>
                                  <div className="url-original-cell" title={url.originalUrl}>
                                    {url.originalUrl}
                                  </div>
                                </td>
                                <td>
                                  <a
                                    href={`${BACKEND_URL}/${url.shortCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="url-short-link"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {BACKEND_URL}/{url.shortCode} <ExternalLink size={12} style={{ display: "inline", marginLeft: "4px" }} />
                                  </a>
                                </td>
                                <td>
                                  <div className="expiry-badge">
                                    <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                                    {new Date(url.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td>
                                  <div className="clicks-badge">{url.clicks}</div>
                                </td>
                                <td>
                                  <div className={`expiry-badge ${isExpired ? "expired" : ""}`}>
                                    {url.expiryDate ? (
                                      <>
                                        <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
                                        {new Date(url.expiryDate).toLocaleDateString()} {new Date(url.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isExpired && " (Expired)"}
                                      </>
                                    ) : (
                                      "No Expiry"
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleCopy(url._id, url.shortCode)}
                                      className="action-btn"
                                      title="Copy URL"
                                    >
                                      {copiedId === url._id ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                    </button>
                                    <button
                                      onClick={() => openQrModal(url.shortCode)}
                                      className="action-btn"
                                      title="Generate QR"
                                    >
                                      <QrCode size={16} />
                                    </button>
                                    <button
                                      onClick={() => openEditModal(url)}
                                      className="action-btn"
                                      title="Edit Destination URL"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <Link
                                      to={`/analytics/${url._id}`}
                                      className="action-btn"
                                      title="View Analytics"
                                    >
                                      <BarChart3 size={16} />
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(url._id)}
                                      className="action-btn delete"
                                      title="Delete Link"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="expanded-row-tr" onClick={(e) => e.stopPropagation()}>
                                  <td colSpan={6}>
                                    <div className="inline-drawer glass-panel">
                                      {inlineLoading && !inlineAnalytics[url._id] ? (
                                        <div className="inline-loader">
                                          <Loader2 className="animate-spin" size={20} color="#6366f1" />
                                          <span>Loading link metrics...</span>
                                        </div>
                                      ) : inlineAnalytics[url._id] ? (
                                        <div className="inline-drawer-content animate-fade-in">
                                          <div className="inline-meta-grid">
                                            <div className="inline-meta-item">
                                              <span className="inline-meta-label">Last Visited</span>
                                              <span className="inline-meta-value">
                                                {url.lastVisited ? new Date(url.lastVisited).toLocaleString() : "Never"}
                                              </span>
                                            </div>
                                            <div className="inline-meta-item">
                                              <span className="inline-meta-label">Created At</span>
                                              <span className="inline-meta-value">
                                                {new Date(url.createdAt).toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="inline-breakdown-grid">
                                            <div className="inline-breakdown-card">
                                              <span className="inline-card-title">Device Share</span>
                                              {inlineAnalytics[url._id].deviceBreakdown.length === 0 ? (
                                                <span className="no-data-text">No traffic registered yet</span>
                                              ) : (
                                                <div className="mini-bar-list">
                                                  {inlineAnalytics[url._id].deviceBreakdown.map((item, idx) => (
                                                    <div className="mini-bar-item" key={item.name}>
                                                      <div className="mini-bar-info">
                                                        <span>{item.name}</span>
                                                        <span>{item.value} click{item.value > 1 ? "s" : ""} ({Math.round((item.value / (url.clicks || 1)) * 100)}%)</span>
                                                      </div>
                                                      <div className="mini-bar-bg">
                                                        <div 
                                                          className={`mini-bar-fill ${idx === 0 ? "purple" : idx === 1 ? "cyan" : "pink"}`}
                                                          style={{ width: `${Math.round((item.value / (url.clicks || 1)) * 100)}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="inline-breakdown-card">
                                              <span className="inline-card-title">Top Browsers</span>
                                              {inlineAnalytics[url._id].browserBreakdown.length === 0 ? (
                                                <span className="no-data-text">No traffic registered yet</span>
                                              ) : (
                                                <div className="mini-bar-list">
                                                  {inlineAnalytics[url._id].browserBreakdown.slice(0, 2).map((item, idx) => (
                                                    <div className="mini-bar-item" key={item.name}>
                                                      <div className="mini-bar-info">
                                                        <span>{item.name}</span>
                                                        <span>{item.value} click{item.value > 1 ? "s" : ""} ({Math.round((item.value / (url.clicks || 1)) * 100)}%)</span>
                                                      </div>
                                                      <div className="mini-bar-bg">
                                                        <div 
                                                          className={`mini-bar-fill ${idx === 0 ? "purple" : "cyan"}`}
                                                          style={{ width: `${Math.round((item.value / (url.clicks || 1)) * 100)}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="inline-error">Failed to load metrics.</div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="pagination-controls">
                      <button
                        onClick={() => fetchDashboardData(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchDashboardData(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Right Column: Live Monitor & Info */}
        <aside className="dashboard-sidebar-col">
          {/* Live Activity Monitor */}
          <div className="sidebar-card glass-panel">
            <h3 className="sidebar-card-title">
              <Activity size={18} className="pulse-slow" style={{ marginRight: "8px", color: "#10b981", verticalAlign: "middle" }} />
              Live Redirect Monitor
            </h3>
            <div className="activity-stream">
              {liveActivities.map((act) => (
                <div key={act.id} className="activity-item animate-fade-in">
                  <div className={`activity-dot ${act.type === "click" ? "green" : "purple"}`} />
                  <div className="activity-details">
                    <span className="activity-desc">
                      New <strong>{act.type}</strong> from {act.location}
                    </span>
                    <span className="activity-meta">
                      Target: /{act.target} • {act.browser} ({act.device})
                    </span>
                  </div>
                  <span className="activity-time">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rebranding Info Panel */}
          <div className="sidebar-card glass-panel promo-card">
            <h3 className="sidebar-card-title text-gradient">SnapLink Premium</h3>
            <p className="promo-text">
              Fully optimized for low latency link redirection, detailed device-analytics logging, and custom short aliases.
            </p>
            <div className="promo-badge">Live Sandbox</div>
          </div>
        </aside>
      </div>

      {/* QR Code Modal */}
      {qrModalUrl && (
        <div className="modal-overlay" onClick={closeQrModal}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeQrModal}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Link QR Code</h3>
            
            <div className="qr-wrapper">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrModalUrl}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <p className="welcome-text" style={{ fontSize: "13px", marginBottom: "20px", wordBreak: "break-all" }}>
              {qrModalUrl}
            </p>

            <button onClick={downloadQrCode} className="qr-download-btn">
              <Download size={18} /> Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Edit URL Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeEditModal}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Edit Destination URL</h3>
            
            {editError && <div className="auth-error" style={{ marginBottom: "16px" }}>{editError}</div>}
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label className="form-label">New Destination URL</label>
                <input
                  type="url"
                  className="form-input edit-input"
                  placeholder="https://example.com/new-destination"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                  disabled={editLoading}
                />
              </div>
              
              <button type="submit" className="edit-save-btn" disabled={editLoading || !editOriginalUrl}>
                {editLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
