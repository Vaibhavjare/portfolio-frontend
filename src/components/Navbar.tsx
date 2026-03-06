import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // Optional: Add a simple scroll effect to add a shadow when scrolling down
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ================= TOP HEADER (Desktop & Mobile Logo) ================= */}
      <header className={`top-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* Logo */}
          <a href="#home" className="nav-brand">
            <span className="font-extrabold gradient-text">Vaibhav</span>
            <span className="mono-text logo-suffix">.dev</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <a href="#about" className="nav-link">About</a>
            <a href="#portfolio" className="nav-link">Projects</a>
            <a href="https://instagram.com/chhava.ai" target="_blank" rel="noreferrer" className="nav-link">
              CHHAVA.AI <span className="nav-badge">Educator</span>
            </a>
            <Link to="/admin/login" className="nav-link admin-link">Admin Panel</Link>
            
            <a href="#contact" className="primary-btn nav-btn">Let's Talk</a>
          </nav>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION DOCK ================= */}
      <nav className="mobile-bottom-nav">
        <a href="#home" className="mobile-nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </a>
        
        <a href="#about" className="mobile-nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>About</span>
        </a>

        <a href="#portfolio" className="mobile-nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Work</span>
        </a>

        <a href="#contact" className="mobile-nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Contact</span>
        </a>

        {/* Highlighted Admin Button */}
        <Link to="/admin/login" className="mobile-nav-item admin-mobile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Admin</span>
        </Link>
      </nav>

      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        /* ================= TOP NAVBAR ================= */
        .top-navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(245, 245, 245, 0.85); /* Matches your Off-White bg */
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .top-navbar.scrolled {
          border-bottom: 1px solid #E7E7E7;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* --- LOGO --- */
        .nav-brand {
          display: flex;
          align-items: baseline;
          text-decoration: none;
          gap: 2px;
        }

        .font-extrabold {
          font-weight: 800;
          font-size: 24px;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(90deg, #3E18F9, #37D7FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-suffix {
          font-size: 14px;
          color: #737373;
          font-weight: 600;
        }

        .mono-text {
          font-family: 'IBM Plex Mono', monospace;
        }

        /* --- DESKTOP NAVIGATION --- */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          text-decoration: none;
          color: #737373;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          color: #000000;
        }

        .admin-link {
          font-family: 'IBM Plex Mono', monospace;
          color: #3E18F9;
        }

        .nav-badge {
          background: #E1EFFE;
          color: #1E429F;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .nav-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          background: #000000;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nav-btn:hover {
          background: #3E18F9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(62, 24, 249, 0.2);
        }

        /* ================= MOBILE BOTTOM NAVIGATION ================= */
        .mobile-bottom-nav {
          display: none; /* Hidden on desktop */
        }

        /* --- RESPONSIVE DESIGN --- */
        @media (max-width: 768px) {
          /* Hide desktop links, keep logo centered or left */
          .desktop-nav {
            display: none;
          }

          .nav-container {
            justify-content: center; /* Center the logo on mobile */
          }

          /* Ensure content isn't hidden behind the bottom bar */
          body {
            padding-bottom: 80px; 
          }

          /* Show Bottom Navigation Dock */
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid #E7E7E7;
            padding: 12px 20px;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
            padding-bottom: calc(12px + env(safe-area-inset-bottom)); /* iOS safe area fix */
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #737373;
            text-decoration: none;
            font-family: 'Inter', sans-serif;
            transition: color 0.2s ease;
            width: 60px;
          }

          .mobile-nav-item span {
            font-size: 11px;
            font-weight: 600;
          }

          .mobile-nav-item:hover, .mobile-nav-item:active {
            color: #3E18F9;
          }

          /* Special styling for Admin button on mobile */
          .admin-mobile {
            color: #3E18F9;
            font-family: 'IBM Plex Mono', monospace;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;