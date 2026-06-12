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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiKey, setApiKey] = useState("sl_live_7c9f82d1653e0281ba45d1f879");
  const [copiedKey, setCopiedKey] = useState(false);


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

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const chars = "abcdef0123456789";
    let newKey = "sl_live_";
    for (let i = 0; i < 26; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
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
          <img src="/logo.png" className="brand-logo-img" alt="SnapLink Logo" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover" }} />
          <div className="brand-logo">SNAPLINK</div>
        </div>

        {/* Navigation Bar */}
        <nav className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Globe size={16} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <Pencil size={16} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="user-profile">
          <span className="welcome-text">
            Welcome, <span className="welcome-name">{user.username}</span>
          </span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Active Page Header Title */}
      <div className="active-page-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 className="active-page-title" style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="indicator-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", display: "inline-block" }}></span>
          {activeTab === "dashboard" ? "Shortener Dashboard" : activeTab === "analytics" ? "Aggregated Analytics Overview" : "Developer & Account Settings"}
        </h1>
      </div>

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

      {/* Shortener Container & URL List (Dashboard Tab) */}
      {activeTab === "dashboard" && (
        <>
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
        </>
      )}

      {/* Analytics Overview Tab */}
      {activeTab === "analytics" && (
        <section className="urls-section glass-panel animate-fade-in" style={{ padding: "32px", animation: "fadeIn 0.4s ease" }}>
          <h2 className="section-title" style={{ marginBottom: "24px" }}>System-Wide Insights</h2>
          {urls.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
              No shortened links found. Create links to view aggregated analytics.
            </div>
          ) : (
            <div>
              <div className="inline-meta-grid" style={{ marginBottom: "30px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "20px" }}>
                <div className="inline-meta-item">
                  <span className="inline-meta-label">Average Clicks per Link</span>
                  <span className="inline-meta-value" style={{ fontSize: "20px", color: "#6366f1", fontWeight: "700" }}>
                    {Math.round((urls.reduce((sum, u) => sum + (u.clicks || 0), 0) / urls.length) * 10) / 10}
                  </span>
                </div>
                <div className="inline-meta-item">
                  <span className="inline-meta-label">Top Performing Link</span>
                  <span className="inline-meta-value" style={{ fontSize: "16px", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }}>
                    {(() => {
                      const top = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];
                      return top ? `/${top.shortCode} (${top.clicks} clicks)` : "N/A";
                    })()}
                  </span>
                </div>
              </div>

              <h3 className="sidebar-card-title" style={{ fontSize: "15px", marginBottom: "16px" }}>Top Links by Click Share</h3>
              <div className="mini-bar-list" style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {(() => {
                  const sorted = [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);
                  const total = urls.reduce((sum, u) => sum + (u.clicks || 0), 0) || 1;
                  return sorted.map((url, idx) => {
                    const pct = Math.round((url.clicks / total) * 100);
                    return (
                      <div className="mini-bar-item" key={url._id}>
                        <div className="mini-bar-info" style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ fontWeight: "500" }}>
                            {url.customAlias ? `/${url.customAlias}` : `/${url.shortCode}`} 
                            <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: "normal", marginLeft: "8px" }} title={url.originalUrl}>
                              ({url.originalUrl.substring(0, 45)}{url.originalUrl.length > 45 ? "..." : ""})
                            </span>
                          </span>
                          <span style={{ fontWeight: "600" }}>{url.clicks} clicks ({pct}%)</span>
                        </div>
                        <div className="mini-bar-bg" style={{ height: "8px" }}>
                          <div 
                            className={`mini-bar-fill ${idx === 0 ? "purple" : idx === 1 ? "cyan" : "pink"}`}
                            style={{ width: `${pct}%`, height: "100%" }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="inline-breakdown-grid" style={{ marginTop: "20px" }}>
                <div className="inline-breakdown-card" style={{ padding: "20px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <span className="inline-card-title" style={{ display: "block", marginBottom: "16px" }}>System Devices Share</span>
                  <div className="mini-bar-list">
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Desktop</span><span>52%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill purple" style={{ width: "52%" }}></div></div>
                    </div>
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Mobile</span><span>41%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill cyan" style={{ width: "41%" }}></div></div>
                    </div>
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Tablet</span><span>7%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill pink" style={{ width: "7%" }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="inline-breakdown-card" style={{ padding: "20px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <span className="inline-card-title" style={{ display: "block", marginBottom: "16px" }}>System Browsers Share</span>
                  <div className="mini-bar-list">
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Chrome</span><span>58%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill purple" style={{ width: "58%" }}></div></div>
                    </div>
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Safari</span><span>24%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill cyan" style={{ width: "24%" }}></div></div>
                    </div>
                    <div className="mini-bar-item">
                      <div className="mini-bar-info"><span>Firefox & Edge</span><span>18%</span></div>
                      <div className="mini-bar-bg"><div className="mini-bar-fill pink" style={{ width: "18%" }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <section className="urls-section glass-panel animate-fade-in" style={{ padding: "32px", animation: "fadeIn 0.4s ease" }}>
          <h2 className="section-title" style={{ marginBottom: "24px" }}>Settings & Developer Portal</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Account Details Card */}
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 className="sidebar-card-title" style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text-main)" }}>Account Profile</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <span className="inline-meta-label">Username</span>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "4px" }}>{user.username}</div>
                </div>
                <div>
                  <span className="inline-meta-label">Email Address</span>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "4px" }}>{user.email}</div>
                </div>
                <div>
                  <span className="inline-meta-label">Plan Tier</span>
                  <div style={{ display: "inline-block", padding: "4px 8px", background: "rgba(99, 102, 241, 0.15)", color: "#8b5cf6", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginTop: "4px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>HACKATHON PRO</div>
                </div>
              </div>
            </div>

            {/* API Access Key Card */}
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 className="sidebar-card-title" style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-main)" }}>Developer API Access</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Integrate SnapLink programmatically into your apps or terminals. Keep your key secure!
              </p>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                <input 
                  type="text" 
                  value={apiKey} 
                  readOnly 
                  style={{ flex: 1, padding: "12px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", borderRadius: "10px", color: "#6366f1", fontFamily: "monospace", fontSize: "14px", fontWeight: "600" }} 
                />
                <button 
                  onClick={handleCopyKey}
                  className="action-btn"
                  style={{ padding: "12px", width: "45px", height: "45px" }}
                  title="Copy Key"
                >
                  {copiedKey ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
                <button 
                  onClick={handleRegenerateKey}
                  className="pagination-btn"
                  style={{ padding: "12px 18px", whiteSpace: "nowrap" }}
                >
                  Regenerate
                </button>
              </div>

              <span className="inline-meta-label" style={{ display: "block", marginBottom: "8px" }}>Example cURL Request</span>
              <pre style={{ padding: "16px", background: "rgba(0,0,0,0.4)", borderRadius: "8px", overflowX: "auto", fontSize: "12px", color: "#06b6d4", fontFamily: "monospace", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
{`curl -X POST https://urlshortener-api.vercel.app/api/urls \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"originalUrl": "https://example.com"}'`}
              </pre>
            </div>

            {/* Custom Domain Settings Card */}
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <h3 className="sidebar-card-title" style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-main)" }}>Custom Shortener Domains</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Add your own domain names to generate custom branded short links.
              </p>

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <input 
                  type="text" 
                  placeholder="e.g. go.mybrand.com"
                  className="option-input"
                  style={{ flex: 1 }}
                  disabled
                />
                <button className="shorten-btn" style={{ padding: "0 20px" }} disabled>Add Domain</button>
              </div>

              <div className="visits-table-container">
                <table className="visits-table">
                  <thead>
                    <tr>
                      <th>Branded Domain</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ fontWeight: "600", color: "#3b82f6" }}>lnk.snaplink.click</span></td>
                      <td>Branded Shortener</td>
                      <td><span style={{ display: "inline-block", padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>Active ✅</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ fontWeight: "600", color: "#9ca3af" }}>go.snaplink.dev</span></td>
                      <td>Fallback Redirect</td>
                      <td><span style={{ display: "inline-block", padding: "2px 8px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>DNS Pending ⏳</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

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
