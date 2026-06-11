import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Laptop,
  Loader2,
  MousePointerClick,
  Smartphone,
  Tablet,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getUrlAnalytics } from "../api/api";
import "./Analytics.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const Analytics = () => {
  const { urlId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await getUrlAnalytics(urlId);
        setData(result);
      } catch (err) {
        setError("Failed to load analytics details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [urlId]);

  if (loading) {
    return (
      <div className="auth-container">
        <Loader2 className="animate-spin" size={48} color="#6366f1" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analytics-container">
        <Link to="/" className="back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="auth-error" style={{ marginTop: "40px" }}>
          {error || "URL Analytics not found."}
        </div>
      </div>
    );
  }

  const { url, analytics } = data;
  const totalClicks = url.clicks || 0;

  // Calculate percentages for Device
  const deviceTotals = analytics.deviceBreakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  const devices = ["Desktop", "Mobile", "Tablet"].map((name) => {
    const found = analytics.deviceBreakdown.find((d) => d.name.toLowerCase() === name.toLowerCase());
    const val = found ? found.value : 0;
    return {
      name,
      value: val,
      percentage: Math.round((val / deviceTotals) * 100),
    };
  });

  // Calculate percentages for Browser
  const browserTotals = analytics.browserBreakdown.reduce((sum, item) => sum + item.value, 0) || 1;
  const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Other"].map((name) => {
    const found = analytics.browserBreakdown.find((b) => b.name.toLowerCase() === name.toLowerCase());
    const val = found ? found.value : 0;
    return {
      name,
      value: val,
      percentage: Math.round((val / browserTotals) * 100),
    };
  });

  // Sort browsers by highest clicks
  browsers.sort((a, b) => b.value - a.value);

  // Map device icons
  const getDeviceIcon = (device) => {
    if (device === "Mobile") return <Smartphone size={16} style={{ verticalAlign: "middle" }} />;
    if (device === "Tablet") return <Tablet size={16} style={{ verticalAlign: "middle" }} />;
    return <Laptop size={16} style={{ verticalAlign: "middle" }} />;
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="analytics-title-group">
          <h1 className="analytics-title">Link Analytics</h1>
          <span className="analytics-subtitle">
            Tracking:{" "}
            <a
              href={`${BACKEND_URL}/${url.shortCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="analytics-short-url"
            >
              {BACKEND_URL}/{url.shortCode} <ExternalLink size={12} style={{ display: "inline" }} />
            </a>
          </span>
        </div>
      </header>

      {/* Info Card */}
      <section className="url-details-panel glass-panel">
        <div className="url-details-info">
          <span className="original-url-label">Original Destination</span>
          <span className="original-url-value">{url.originalUrl}</span>
          <span className="expiry-badge" style={{ marginTop: "6px" }}>
            Created: {new Date(url.createdAt).toLocaleDateString()} • Expiry:{" "}
            {url.expiryDate ? new Date(url.expiryDate).toLocaleDateString() : "Never"}
          </span>
        </div>
        <div className="analytics-clicks-card">
          <span className="clicks-label">Total Visits</span>
          <div className="clicks-value">{totalClicks}</div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="charts-grid">
        {/* Click Trend AreaChart */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-panel-title">Click Trend (Last 7 Days)</h3>
          {totalClicks === 0 ? (
            <div className="no-data-msg">No click events registered yet.</div>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={analytics.clickTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickFormatter={(tick) => {
                      const parts = tick.split("-");
                      return `${parts[1]}/${parts[2]}`;
                    }}
                  />
                  <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "10px",
                      color: "#f3f4f6",
                      fontFamily: "Inter, sans-serif"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Device breakdown & Browser breakdown list */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-panel-title">Device & Browser Mix</h3>
          {totalClicks === 0 ? (
            <div className="no-data-msg">No statistics available.</div>
          ) : (
            <div className="dist-list">
              <span className="original-url-label" style={{ fontSize: "11px", marginBottom: "-8px" }}>Devices</span>
              {devices.map((device, idx) => (
                <div className="dist-item" key={device.name}>
                  <div className="dist-info">
                    <span className="dist-name">
                      {getDeviceIcon(device.name)} {device.name}
                    </span>
                    <span className="dist-value">{device.value} ({device.percentage}%)</span>
                  </div>
                  <div className="dist-bar-bg">
                    <div
                      className={`dist-bar-fill ${idx === 0 ? "purple" : idx === 1 ? "cyan" : "pink"}`}
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              <span className="original-url-label" style={{ fontSize: "11px", marginTop: "12px", marginBottom: "-8px" }}>Top Browsers</span>
              {browsers.slice(0, 3).map((browser, idx) => (
                <div className="dist-item" key={browser.name}>
                  <div className="dist-info">
                    <span className="dist-name">{browser.name}</span>
                    <span className="dist-value">{browser.value} ({browser.percentage}%)</span>
                  </div>
                  <div className="dist-bar-bg">
                    <div
                      className={`dist-bar-fill ${idx === 0 ? "purple" : idx === 1 ? "cyan" : "pink"}`}
                      style={{ width: `${browser.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Log list */}
      <section className="visits-section glass-panel">
        <h3 className="chart-panel-title" style={{ marginBottom: "16px" }}>Recent Visits Log</h3>
        {analytics.recentVisits.length === 0 ? (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No visit history registered for this link yet.
          </div>
        ) : (
          <div className="visits-table-container">
            <table className="visits-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentVisits.map((visit) => (
                  <tr key={visit._id}>
                    <td>
                      <div className="visit-highlight" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={12} color="var(--text-muted)" />
                        {new Date(visit.visitedAt).toLocaleDateString()} {new Date(visit.visitedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>{visit.ipAddress}</td>
                    <td>
                      <span className="device-badge">
                        {getDeviceIcon(visit.device)} {visit.device}
                      </span>
                    </td>
                    <td>
                      <span className="browser-badge">{visit.browser}</span>
                    </td>
                    <td>{visit.referer || "Direct"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;
