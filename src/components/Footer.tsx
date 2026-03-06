import React from "react";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        {/* Brand & Tagline */}
        <div className="footer-brand">
          <h2>
            <span className="gradient-text">Vaibhav Jare</span>
          </h2>
          <p className="subtitle">
            AI/ML Engineer & Full Stack Developer building intelligent, scalable applications.
          </p>
          <div className="status-indicator">
            <span className="dot"></span>
            <span className="mono-text">System Status: Online</span>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="footer-links">
          <div className="link-column">
            <h4>Navigation</h4>
            <a href="#about">About</a>
            <a href="#stack">Tech Stack</a>
            <a href="#projects">Projects</a>
            <a href="/admin/login">Admin Login</a>
          </div>

          <div className="link-column">
            <h4>Connect</h4>
            <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://instagram.com/chhava.ai" target="_blank" rel="noreferrer">
              CHHAVA.AI <span className="badge">Insta</span>
            </a>
            <a href="mailto:contact@example.com">Email Me</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Vaibhav Jare. All rights reserved.</p>
        <p className="mono-text built-with">
          Built with React • Redux • Agentic Architecture
        </p>
      </div>

      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;800&display=swap');

        .footer-wrapper {
          background: #FFFFFF; /* Clean white contrast to the off-white sections */
          border-top: 1px solid #E7E7E7;
          font-family: 'Inter', sans-serif;
          color: #000000;
          padding: 80px 5% 40px 5%;
          position: relative;
          overflow: hidden;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 60px;
          margin-bottom: 60px;
        }

        /* --- BRAND SECTION --- */
        .footer-brand {
          max-width: 400px;
        }

        .footer-brand h2 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
        }

        .gradient-text {
          background: linear-gradient(90deg, #3E18F9, #37D7FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #737373;
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #F9FAFB;
          border: 1px solid #E7E7E7;
          border-radius: 6px;
        }

        .status-indicator .dot {
          width: 8px;
          height: 8px;
          background-color: #10B981; /* Emerald Green */
          border-radius: 50%;
          box-shadow: 0 0 8px #10B981;
        }

        .mono-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #737373;
        }

        /* --- LINKS SECTION --- */
        .footer-links {
          display: flex;
          gap: 80px;
          flex-wrap: wrap;
        }

        .link-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .link-column h4 {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0 0 8px 0;
        }

        .link-column a {
          color: #737373;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .link-column a:hover {
          color: #3E18F9; /* LlamaIndex Purple on hover */
          transform: translateX(4px);
        }

        .badge {
          background: #FF8DF2; /* Vibrant Pink */
          color: #000000;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        /* --- BOTTOM BAR --- */
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid #E7E7E7;
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-bottom p {
          color: #737373;
          font-size: 14px;
          margin: 0;
        }

        .built-with {
          color: #A3A3A3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 40px;
          }
          
          .footer-links {
            gap: 40px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;