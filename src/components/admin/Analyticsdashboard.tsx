import React from "react";
import { useGetAnalyticsStatsQuery } from "../../redux/services/analyticsApi";
import { TrendingUp, Users, Eye, Clock } from "lucide-react";

const AnalyticsDashboard = () => {
  const { data: stats, isLoading, error } = useGetAnalyticsStatsQuery();

  if (isLoading) {
    return (
      <div className="an-loading">
        <div className="an-loading-ring" />
        <span>Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="an-error">
        <div className="an-error-icon">⚠️</div>
        <h3>Failed to load analytics</h3>
        <p>Please try refreshing the page</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="an-wrapper">
      {/* ══════════════ PAGE HEADER ══════════════ */}
      <div className="an-page-header">
        <div>
          <h2>Analytics <span className="an-gradient-text">Dashboard</span></h2>
          <p className="an-subtitle">Monitor your portfolio performance and visitor insights</p>
        </div>
      </div>

      {/* ══════════════ STATS CARDS ══════════════ */}
      <div className="an-stats-grid">
        {/* Total Visitors */}
        <div className="an-stat-card an-stat-card-primary">
          <div className="an-stat-header">
            <div className="an-stat-icon an-stat-icon-primary">
              <Users size={24} />
            </div>
            <TrendingUp size={16} className="an-trend-icon" />
          </div>
          <div className="an-stat-content">
            <div className="an-stat-value">{stats?.total_visitors.toLocaleString() ?? 0}</div>
            <div className="an-stat-label">Total Visitors</div>
          </div>
        </div>

        {/* Today's Visitors */}
        <div className="an-stat-card an-stat-card-success">
          <div className="an-stat-header">
            <div className="an-stat-icon an-stat-icon-success">
              <Users size={24} />
            </div>
            <div className="an-badge an-badge-success">Today</div>
          </div>
          <div className="an-stat-content">
            <div className="an-stat-value">{stats?.today_visitors.toLocaleString() ?? 0}</div>
            <div className="an-stat-label">Today's Visitors</div>
          </div>
        </div>

        {/* Page Views */}
        <div className="an-stat-card an-stat-card-info">
          <div className="an-stat-header">
            <div className="an-stat-icon an-stat-icon-info">
              <Eye size={24} />
            </div>
          </div>
          <div className="an-stat-content">
            <div className="an-stat-value">{stats?.page_views.toLocaleString() ?? 0}</div>
            <div className="an-stat-label">Total Page Views</div>
          </div>
        </div>

        {/* Avg Session Time */}
        <div className="an-stat-card an-stat-card-warning">
          <div className="an-stat-header">
            <div className="an-stat-icon an-stat-icon-warning">
              <Clock size={24} />
            </div>
          </div>
          <div className="an-stat-content">
            <div className="an-stat-value">
              {stats?.average_session_time_seconds 
                ? formatTime(stats.average_session_time_seconds)
                : "0s"}
            </div>
            <div className="an-stat-label">Avg Session Time</div>
          </div>
        </div>
      </div>

      {/* ══════════════ INFO SECTION ══════════════ */}
      <div className="an-info-section">
        <div className="an-info-card">
          <h3 className="an-info-title">📊 Analytics Overview</h3>
          <p className="an-info-text">
            This dashboard provides real-time insights into your portfolio's performance. 
            Track visitor engagement, page views, and session duration to understand how 
            users interact with your content.
          </p>
          <div className="an-info-metrics">
            <div className="an-metric-item">
              <span className="an-metric-label">Engagement Rate</span>
              <span className="an-metric-value">
                {stats?.average_session_time_seconds && stats.average_session_time_seconds > 30 
                  ? "High" 
                  : "Medium"}
              </span>
            </div>
            <div className="an-metric-item">
              <span className="an-metric-label">Views per Visitor</span>
              <span className="an-metric-value">
                {stats?.total_visitors && stats.page_views
                  ? (stats.page_views / stats.total_visitors).toFixed(1)
                  : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        :root {
          --an-bg: #F7F8FC; --an-card: #FFFFFF; --an-border: rgba(15,23,42,0.10);
          --an-text: #0F172A; --an-muted: rgba(15,23,42,0.55);
          --an-primary: #6366f1; --an-success: #22c55e; --an-info: #3b82f6; --an-warning: #f59e0b;
        }

        @keyframes an-fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes an-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes an-spin360 { to{transform:rotate(360deg)} }
        @keyframes an-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }

        .an-wrapper {
          width:100%; max-width:1300px; margin:0 auto; padding:32px 24px 64px;
          box-sizing:border-box; font-family:'Inter',sans-serif; color:var(--an-text);
          background: radial-gradient(60% 70% at 20% 25%, rgba(99,102,241,0.06) 0%, transparent 60%), var(--an-bg);
        }

        .an-page-header {
          margin-bottom:32px; animation:an-fadeDown 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .an-page-header h2 {
          font-size:clamp(26px,5vw,36px); font-weight:900; letter-spacing:-0.03em;
          margin:0 0 6px; line-height:1.1;
        }
        .an-gradient-text {
          background:linear-gradient(90deg, #6366f1 0%, #a855f7 110%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .an-subtitle { color:var(--an-muted); font-size:15px; margin:0; font-weight:500; }

        .an-stats-grid {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px;
          margin-bottom:32px; animation:an-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.08s;
        }

        .an-stat-card {
          background:var(--an-card); border-radius:16px; border:1px solid var(--an-border);
          padding:24px; box-shadow:0 4px 14px rgba(2,6,23,0.04);
          transition:all 0.22s ease; position:relative; overflow:hidden;
        }
        .an-stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(2,6,23,0.10); }

        .an-stat-card::before {
          content:""; position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(90deg, var(--card-color, #6366f1), transparent);
          opacity:0.5;
        }

        .an-stat-card-primary { --card-color: #6366f1; }
        .an-stat-card-success { --card-color: #22c55e; }
        .an-stat-card-info { --card-color: #3b82f6; }
        .an-stat-card-warning { --card-color: #f59e0b; }

        .an-stat-header {
          display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;
        }

        .an-stat-icon {
          width:52px; height:52px; border-radius:12px; display:flex; align-items:center;
          justify-content:center; color:#fff;
        }
        .an-stat-icon-primary { background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
        .an-stat-icon-success { background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
        .an-stat-icon-info { background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
        .an-stat-icon-warning { background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

        .an-trend-icon { color:#22c55e; animation:an-pulse 2s ease-in-out infinite; }

        .an-badge {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          padding:4px 8px; border-radius:6px; text-transform:uppercase; letter-spacing:0.05em;
        }
        .an-badge-success { background:rgba(34,197,94,0.12); color:#16a34a; }

        .an-stat-content { }
        .an-stat-value {
          font-size:36px; font-weight:900; letter-spacing:-0.02em; margin:0 0 4px;
          color:var(--an-text); line-height:1;
        }
        .an-stat-label {
          font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:700;
          color:var(--an-muted); text-transform:uppercase; letter-spacing:0.05em;
        }

        .an-info-section {
          animation:an-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; animation-delay:0.16s;
        }

        .an-info-card {
          background:var(--an-card); border-radius:16px; border:1px solid var(--an-border);
          padding:28px; box-shadow:0 4px 14px rgba(2,6,23,0.04);
        }

        .an-info-title { font-size:20px; font-weight:800; margin:0 0 12px; }
        .an-info-text {
          font-size:15px; line-height:1.7; color:var(--an-muted); margin:0 0 24px;
        }

        .an-info-metrics {
          display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px;
          padding-top:20px; border-top:1px solid var(--an-border);
        }

        .an-metric-item {
          display:flex; flex-direction:column; gap:6px;
        }
        .an-metric-label {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          color:var(--an-muted); text-transform:uppercase; letter-spacing:0.05em;
        }
        .an-metric-value {
          font-size:24px; font-weight:800; color:var(--an-text);
        }

        .an-loading, .an-error {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:100px 20px; gap:16px; text-align:center;
        }
        .an-loading-ring {
          width:40px; height:40px; border:3px solid rgba(99,102,241,0.18);
          border-top-color:var(--an-primary); border-radius:50%;
          animation:an-spin360 0.7s linear infinite;
        }
        .an-loading {
          font-family:'IBM Plex Mono',monospace; font-size:14px; color:var(--an-muted);
        }

        .an-error-icon { font-size:52px; }
        .an-error h3 { font-size:20px; font-weight:900; margin:0 0 6px; }
        .an-error p { color:var(--an-muted); font-size:14px; margin:0; }

        @media (max-width:768px) {
          .an-wrapper { padding:20px 16px 48px; }
          .an-stats-grid { grid-template-columns:1fr; }
          .an-stat-value { font-size:32px; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;