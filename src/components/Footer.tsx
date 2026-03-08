
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      {/* Animated Top Gradient Line */}
      <div className="footer-topline" />

      <div className="footer-content">
        {/* ── Brand ── */}
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            <span className="gradient-text footer-logo-name">Vaibhav</span>
            <span className="footer-logo-suffix mono-text">.dev</span>
          </a>
          <p className="footer-tagline">
            AI/ML Engineer &amp; Full Stack Developer building intelligent,
            scalable applications powered by Agentic AI.
          </p>
          <div className="footer-status">
            <span className="dot footer-dot" />
            <span className="mono-text footer-status-text">Available for work</span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="footer-nav-group">
          <h4 className="footer-nav-title">Navigation</h4>
          <div className="footer-nav-links">
            {[
              ["#about",        "About"],
              ["#experience",   "Experience"],
              ["#skills",       "Tech Stack"],
              ["#portfolio",    "Projects"],
              ["#certificates", "Certifications"],
              ["#achievements", "Achievements"],
              ["#contact",      "Contact"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="footer-nav-link">{label}</a>
            ))}
          </div>
        </div>

        {/* ── Connect ── */}
        <div className="footer-nav-group">
          <h4 className="footer-nav-title">Connect</h4>
          <div className="footer-nav-links">
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="footer-nav-link footer-social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="footer-nav-link footer-social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a href="mailto:contact@vaibhavjare.dev" className="footer-nav-link footer-social-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Email Me
            </a>
          </div>
        </div>

        {/* ── Admin ── */}
        <div className="footer-admin-group">
          <h4 className="footer-nav-title">Admin</h4>
          <p className="footer-admin-desc">
            Manage portfolio content, projects, and settings from the admin panel.
          </p>
          <Link to="/admin/login" className="footer-admin-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Admin Panel
          </Link>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {year}{" "}
          <span className="gradient-text" style={{ fontWeight: 800 }}>Vaibhav Jare</span>.
          All rights reserved.
        </p>
        <p className="mono-text footer-built">
          Built with React · Redux · Agentic Architecture
        </p>
      </div>

      <style>{`
        @keyframes footer-topline-anim { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

        .footer-wrapper {
          background: #FFFFFF;
          border-top: 1px solid #EFEFEF;
          font-family: 'Inter', sans-serif;
          color: #000000;
          position: relative; 
          overflow: hidden;
        }

        .footer-topline {
          height: 3px;
          background: linear-gradient(90deg,#3E18F9,#37D7FA,#FF8DF2,#3E18F9);
          background-size: 300% 100%;
          animation: footer-topline-anim 4s linear infinite;
        }

        .footer-content {
          max-width: 1200px; margin: 0 auto;
          padding: 60px 5% 48px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.3fr;
          gap: 48px; align-items: start;
        }

        .footer-brand  { display: flex; flex-direction: column; gap: 14px; }
        .footer-logo   { display: inline-flex; align-items: baseline; gap: 2px; text-decoration: none; width: fit-content; }
        .footer-logo-name   { font-weight: 900; font-size: 26px; letter-spacing: -.04em; }
        .footer-logo-suffix { font-size: 14px; color: #737373; font-weight: 600; }
        .footer-tagline { color: #737373; font-size: 14px; line-height: 1.65; margin: 0; max-width: 280px; }

        .footer-status {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; background: #F9FAFB;
          border: 1px solid #EFEFEF; border-radius: 8px; width: fit-content;
        }
        .footer-dot   { width: 8px; height: 8px; background: #10B981 !important; border-radius: 50%; animation: pulse 2s infinite; box-shadow: 0 0 6px rgba(16,185,129,.4); flex-shrink: 0; }
        .footer-status-text { font-size: 12px; color: #52525B; }

        .footer-nav-group  { display: flex; flex-direction: column; gap: 16px; }
        .footer-nav-title  { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .10em; color: #000000; margin: 0; }
        .footer-nav-links  { display: flex; flex-direction: column; gap: 10px; }
        .footer-nav-link   { color: #737373; text-decoration: none; font-size: 14px; font-weight: 500; transition: all .18s ease; display: flex; align-items: center; gap: 7px; }
        .footer-nav-link:hover  { color: #3E18F9; transform: translateX(4px); }
        .footer-social-link { font-weight: 600; }

        .footer-admin-group { display: flex; flex-direction: column; gap: 14px; }
        .footer-admin-desc  { font-size: 13px; color: #737373; line-height: 1.58; margin: 0; }
        .footer-admin-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 20px; border-radius: 8px;
          background: #000000; color: white;
          font-size: 13px; font-weight: 700; text-decoration: none;
          border: 1.5px solid #000000;
          font-family: 'IBM Plex Mono', monospace;
          transition: all .22s ease; width: fit-content;
          box-shadow: 0 4px 14px rgba(0,0,0,.10);
        }
        .footer-admin-btn:hover {
          background: #3E18F9; border-color: #3E18F9;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(62,24,249,.28);
        }

        .footer-bottom {
          max-width: 1200px; margin: 0 auto;
          padding: 20px 5% 32px;
          border-top: 1px solid #EFEFEF;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .footer-copy  { color: #737373; font-size: 13px; margin: 0; }
        .footer-built { font-size: 11px; color: #A3A3A3; }

        /* Responsive Breakpoints */
        @media(max-width: 1024px) { 
          .footer-content { grid-template-columns: 1fr 1fr; gap: 36px; } 
          .footer-brand { grid-column: 1 / -1; } 
        }
        
        @media(max-width: 768px) {
          /* Add extra padding at the bottom for mobile so the footer text isn't hidden behind the floating mobile nav */
          .footer-wrapper {
             padding-bottom: 80px; 
          }
        }

        @media(max-width: 640px)  { 
          .footer-content { grid-template-columns: 1fr; padding: 40px 5% 32px; } 
          .footer-bottom { flex-direction: column; text-align: center; } 
        }
      `}</style>
    </footer>
  );
};

export default Footer;