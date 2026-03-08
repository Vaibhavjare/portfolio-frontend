import { useState } from "react";
import { useDispatch } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-container">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2><span className="gradient-text">Admin</span>Panel</h2>
        </div>

        {/* Main nav */}
        <nav className="sidebar-nav">
          <p className="nav-group-title">MAIN</p>
          <NavLink to="/admin/dashboard" end className="nav-item">
            <span className="nav-icon">📊</span> <span className="nav-text">Overview</span>
          </NavLink>
          <NavLink to="/admin/dashboard/leads" className="nav-item">
            <span className="nav-icon">💼</span> <span className="nav-text">Leads</span>
          </NavLink>
          <NavLink to="/admin/dashboard/content" className="nav-item">
            <span className="nav-icon">📱</span> <span className="nav-text">Content</span>
          </NavLink>
        </nav>

        {/* Footer manage links */}
        <div className="sidebar-footer">
          <p className="nav-group-title" style={{ margin: "0 4px 8px" }}>MANAGE</p>

          {/* Profile */}
          <NavLink to="/admin/dashboard/settings" className="footer-nav-btn">
            <span className="footer-btn-icon">👤</span> <span className="nav-text">Profile</span>
          </NavLink>

          {/* Projects */}
          <NavLink to="/admin/dashboard/projects" className="footer-nav-btn footer-nav-btn--projects">
            <span className="footer-btn-icon">🗂️</span> <span className="nav-text">Projects</span>
          </NavLink>

          {/* Skills */}
          <NavLink to="/admin/dashboard/skills" className="footer-nav-btn footer-nav-btn--skills">
            <span className="footer-btn-icon">⚡</span> <span className="nav-text">Skills</span>
          </NavLink>

          {/* Certificates */}
          <NavLink to="/admin/dashboard/certificates" className="footer-nav-btn footer-nav-btn--certs">
            <span className="footer-btn-icon">🎓</span> <span className="nav-text">Certificates</span>
          </NavLink>

          {/* Testimonials */}
          <NavLink to="/admin/dashboard/testimonials" className="footer-nav-btn footer-nav-btn--testimonials">
            <span className="footer-btn-icon">💬</span> <span className="nav-text">Testimonials</span>
          </NavLink>

          {/* Blogs */}
          <NavLink to="/admin/dashboard/blog" className="footer-nav-btn footer-nav-btn--blogs">
            <span className="footer-btn-icon">📝</span> <span className="nav-text">Blogs</span>
          </NavLink>

          {/* Analytics */}
          <NavLink to="/admin/dashboard/analytics" className="footer-nav-btn footer-nav-btn--analytics">
            <span className="footer-btn-icon">📈</span> <span className="nav-text">Analytics</span>
          </NavLink>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="footer-btn-icon">🔐</span> <span className="nav-text">Logout</span>
          </button>

          {/* Real button for mobile "More" menu instead of CSS ::after */}
          <button className="mobile-more-trigger" onClick={() => setMoreMenuOpen(true)}>
            ⋮
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">
        <div className="aurora-container">
          <div className="glow glow-cyan" />
          <div className="glow glow-purple" />
        </div>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* ================= MOBILE MORE MENU ================= */}
      {moreMenuOpen && (
        <div className="mobile-more-overlay" onClick={() => setMoreMenuOpen(false)}>
          <div className="mobile-more-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-more-header">
              <h3>More Options</h3>
              <button className="mobile-more-close" onClick={() => setMoreMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-more-content">
              <NavLink 
                to="/admin/dashboard/testimonials" 
                className="mobile-more-item"
                onClick={() => setMoreMenuOpen(false)}
              >
                <span className="mobile-more-icon">💬</span>
                <span>Testimonials</span>
              </NavLink>
              <NavLink 
                to="/admin/dashboard/blog" 
                className="mobile-more-item"
                onClick={() => setMoreMenuOpen(false)}
              >
                <span className="mobile-more-icon">📝</span>
                <span>Blogs</span>
              </NavLink>
              <NavLink 
                to="/admin/dashboard/analytics" 
                className="mobile-more-item"
                onClick={() => setMoreMenuOpen(false)}
              >
                <span className="mobile-more-icon">📈</span>
                <span>Analytics</span>
              </NavLink>
              <NavLink 
                to="/admin/dashboard/leads" 
                className="mobile-more-item"
                onClick={() => setMoreMenuOpen(false)}
              >
                <span className="mobile-more-icon">💼</span>
                <span>Leads</span>
              </NavLink>
              <NavLink 
                to="/admin/dashboard/content" 
                className="mobile-more-item"
                onClick={() => setMoreMenuOpen(false)}
              >
                <span className="mobile-more-icon">📱</span>
                <span>Content</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;800&display=swap');

        :root {
          --li-bg:         #FCFCFC;
          --li-card-bg:    #FFFFFF;
          --li-border:     #EFEFEF;
          --li-text-main:  #000000;
          --li-text-muted: #52525B;
          --li-cyan:       #37D7FA;
          --li-purple:     #3E18F9;
          --li-pink:       #FF8DF2;
        }

        * { box-sizing: border-box; }
        h1, h2, h3 { font-weight: 800; letter-spacing: -0.03em; margin: 0; }

        .gradient-text {
          background: linear-gradient(90deg, var(--li-purple), var(--li-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ── Layout ── */
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: var(--li-bg);
          color: var(--li-text-main);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          background: var(--li-card-bg);
          border-right: 1px solid var(--li-border);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 20;
          overflow-y: auto;
        }

        .sidebar-header { padding: 0 24px 28px 24px; flex-shrink: 0; }
        .sidebar-header h2 { font-size: 20px; }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
          flex: 1;
        }

        .nav-group-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #A1A1AA;
          padding: 0 12px;
          margin-bottom: 6px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        .nav-item {
          padding: 11px 14px;
          border-radius: 8px;
          color: var(--li-text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-icon { font-size: 14px; flex-shrink: 0; }
        .nav-item:hover { background: var(--li-bg); color: var(--li-text-main); }
        .nav-item.active {
          background: rgba(55, 215, 250, 0.10);
          color: var(--li-purple);
          font-weight: 600;
        }

        /* ── Sidebar Footer ── */
        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 14px 12px;
          border-top: 1px solid var(--li-border);
          margin-top: auto;
          flex-shrink: 0;
        }

        .footer-nav-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--li-border);
          background: var(--li-bg);
          color: var(--li-text-muted);
          font-weight: 600;
          font-size: 13px;
          text-align: left;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.18s ease;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .footer-nav-btn:hover,
        .footer-nav-btn.active {
          background: rgba(55, 215, 250, 0.10);
          color: var(--li-purple);
          border-color: rgba(62, 24, 249, 0.20);
        }

        /* Projects accent */
        .footer-nav-btn--projects:hover,
        .footer-nav-btn--projects.active {
          background: rgba(62, 24, 249, 0.08);
          color: var(--li-purple);
          border-color: rgba(62, 24, 249, 0.25);
        }

        /* Skills accent */
        .footer-nav-btn--skills:hover,
        .footer-nav-btn--skills.active {
          background: rgba(55, 215, 250, 0.12);
          color: #0891b2;
          border-color: rgba(55, 215, 250, 0.40);
        }

        /* Certificates accent — gold */
        .footer-nav-btn--certs:hover,
        .footer-nav-btn--certs.active {
          background: rgba(245, 158, 11, 0.10);
          color: #b45309;
          border-color: rgba(245, 158, 11, 0.35);
        }

        /* Testimonials accent — purple */
        .footer-nav-btn--testimonials:hover,
        .footer-nav-btn--testimonials.active {
          background: rgba(168, 85, 247, 0.10);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.35);
        }

        /* Blogs accent — green */
        .footer-nav-btn--blogs:hover,
        .footer-nav-btn--blogs.active {
          background: rgba(34, 197, 94, 0.10);
          color: #16a34a;
          border-color: rgba(34, 197, 94, 0.35);
        }

        /* Analytics accent — blue */
        .footer-nav-btn--analytics:hover,
        .footer-nav-btn--analytics.active {
          background: rgba(59, 130, 246, 0.10);
          color: #2563eb;
          border-color: rgba(59, 130, 246, 0.35);
        }

        .footer-btn-icon { font-size: 14px; flex-shrink: 0; }

        .logout-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid var(--li-border);
          background: transparent;
          color: var(--li-text-main);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.18s ease;
          font-family: 'Inter', sans-serif;
          margin-top: 4px;
        }
        .logout-btn:hover {
          background: var(--li-text-main);
          color: #FFFFFF;
          border-color: var(--li-text-main);
        }

        /* Hide the new mobile button on desktop */
        .mobile-more-trigger {
          display: none;
        }

        /* ── Main content ── */
        .main-content {
          flex: 1;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          min-width: 0;
        }

        .aurora-container {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 100%;
          overflow: hidden; z-index: 0; pointer-events: none;
        }

        .glow {
          position: absolute; border-radius: 50%;
          filter: blur(120px); opacity: 0.3; mix-blend-mode: multiply;
          animation: floatGlow 12s ease-in-out infinite alternate;
        }
        .glow-cyan   { width:500px; height:500px; background:var(--li-cyan);   top:-100px; right:-100px; animation-delay:0s; }
        .glow-purple { width:400px; height:400px; background:var(--li-purple); bottom:10%; left:-50px;   opacity:0.2; animation-delay:-3s; }

        @keyframes floatGlow {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, 30px) scale(1.1); }
        }

        .content-wrapper { padding: 40px 48px; position: relative; z-index: 10; }

        /* ── Mobile More Menu ── */
        .mobile-more-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 2000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .mobile-more-menu {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-top-left-radius: 24px;
          border-top-right-radius: 24px;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
          animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          max-height: 70vh;
          overflow-y: auto;
        }

        .mobile-more-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--li-border);
        }

        .mobile-more-header h3 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }

        .mobile-more-close {
          background: var(--li-bg);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-more-close:hover {
          background: var(--li-border);
          transform: rotate(90deg);
        }

        .mobile-more-content {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-more-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: var(--li-bg);
          border: 1px solid var(--li-border);
          text-decoration: none;
          color: var(--li-text-main);
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s ease;
        }

        .mobile-more-item:hover,
        .mobile-more-item.active {
          background: rgba(62, 24, 249, 0.08);
          color: var(--li-purple);
          border-color: rgba(62, 24, 249, 0.25);
          transform: translateX(4px);
        }

        .mobile-more-icon {
          font-size: 22px;
          flex-shrink: 0;
        }

        /* ── Responsive Mobile Bottom Bar ── */
        @media (max-width: 768px) {
          .dashboard-container { flex-direction: column; }
          
          /* Show More Menu Overlay on Mobile */
          .mobile-more-overlay {
            display: flex;
            align-items: flex-end;
          }

          /* Transform sidebar to fixed bottom glass bar */
          .sidebar {
            width: 100%; height: auto; border-right: none;
            position: fixed; bottom: 0; left: 0; right: 0; top: auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid var(--li-border);
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
            padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
            display: flex; flex-direction: row; justify-content: space-evenly; align-items: center;
            z-index: 1000; overflow: visible;
          }

          /* Hide unneeded elements on mobile */
          .sidebar-header, .nav-group-title { display: none; }

          /* Hide certain nav items on mobile (show only 5 + More) */
          .sidebar-nav .nav-item:not(:first-child) { display: none; } /* Hide Leads, Content */

          /* Hide extra footer items, keep only Profile, Skills, Certs, Projects, Logout */
          .footer-nav-btn--testimonials,
          .footer-nav-btn--blogs,
          .footer-nav-btn--analytics {
            display: none;
          }

          /* Magic layout trick: makes list items direct flex children of sidebar */
          .sidebar-nav, .sidebar-footer { display: contents; }

          /* Style the individual buttons as icons only */
          .nav-item, .footer-nav-btn, .logout-btn {
            width: auto; min-width: 44px; padding: 6px; margin: 0;
            border: none; background: transparent !important;
            flex-direction: column; justify-content: center; align-items: center;
            box-shadow: none !important; position: relative;
          }
          
          .nav-text { display: none; }
          
          .nav-icon, .footer-btn-icon {
            font-size: 22px; margin: 0;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          /* Mobile Active State Icon Pop */
          .nav-item.active .nav-icon, 
          .footer-nav-btn.active .footer-btn-icon {
            transform: translateY(-4px) scale(1.15);
            filter: drop-shadow(0 4px 6px rgba(62, 24, 249, 0.3));
          }

          /* Show the actual button instead of CSS pseudo-element */
          .mobile-more-trigger {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            width: 44px;
            height: 44px;
            cursor: pointer;
            color: var(--li-text-muted);
            background: transparent;
            border: none;
            order: 999; /* Forces the button to be the last item on the right */
            transition: all 0.2s ease;
          }

          .content-wrapper { padding: 24px 16px 100px; } /* Prevent content from hiding behind the bottom nav */
          .glow-cyan { top:-50px; right:-50px; width:300px; height:300px; }
        }

        @media (max-width: 480px) {
          .content-wrapper { padding: 18px 12px 90px; }
          .nav-icon, .footer-btn-icon { font-size: 20px; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;