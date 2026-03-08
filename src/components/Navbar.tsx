import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const SECTIONS = [
      "home", "about", "experience", "skills",
      "portfolio", "certificates", "achievements", "contact",
    ];

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section tracking
      const reversed = [...SECTIONS].reverse();
      for (const id of reversed) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NAV_LINKS: [string, string][] = [
    ["#about",        "About"],
    ["#experience",   "Experience"],
    ["#skills",       "Skills"],
    ["#portfolio",    "Projects"],
    ["#certificates", "Certs"],
    ["#achievements", "Achievements"],
    ["#contact",      "Contact"],
  ];

  return (
    <>
      {/* ================= TOP HEADER ================= */}
      <header className={`top-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">

          {/* Logo */}
          <a href="#home" className="nav-brand">
            <span className="font-extrabold gradient-text">Vaibhav</span>
            <span className="mono-text logo-suffix">.dev</span>
          </a>

          {/* Desktop Navigation — NO Admin, NO CHHAVA.AI */}
          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`nav-link${activeSection === href.slice(1) ? " nav-link--active" : ""}`}
              >
                {label}
              </a>
            ))}
            <a href="#contact" className="nav-cta-btn">Let's Talk</a>
          </nav>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">

        <a href="#home" className={`mobile-nav-item${activeSection === "home" ? " mobile-nav-item--active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </a>

        <a href="#about" className={`mobile-nav-item${activeSection === "about" ? " mobile-nav-item--active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>About</span>
        </a>

        <a href="#experience" className={`mobile-nav-item${activeSection === "experience" ? " mobile-nav-item--active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
          <span>Journey</span>
        </a>

        <a href="#portfolio" className={`mobile-nav-item${activeSection === "portfolio" ? " mobile-nav-item--active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/>
            <polyline points="8 6 2 12 8 18"/>
          </svg>
          <span>Work</span>
        </a>

        <a href="#contact" className={`mobile-nav-item${activeSection === "contact" ? " mobile-nav-item--active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>Contact</span>
        </a>

      </nav>

      {/* ===== STYLES ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── TOP NAVBAR ── */
        .top-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: rgba(252, 252, 252, 0.88);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        .top-navbar.scrolled {
          border-bottom: 1px solid #EFEFEF;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Logo */
        .nav-brand {
          display: flex;
          align-items: baseline;
          text-decoration: none;
          gap: 1px;
          flex-shrink: 0;
        }
        .font-extrabold {
          font-weight: 900;
          font-size: 23px;
          letter-spacing: -0.04em;
        }
        .gradient-text {
          background: linear-gradient(90deg, #3E18F9, #37D7FA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-suffix {
          font-size: 13px;
          color: #737373;
          font-weight: 600;
        }
        .mono-text {
          font-family: 'IBM Plex Mono', monospace;
        }

        /* Desktop nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        /* Nav links with underline animation */
        .nav-link {
          text-decoration: none;
          color: #737373;
          font-weight: 600;
          font-size: 13.5px;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
          position: relative;
          padding-bottom: 3px;
          white-space: nowrap;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #3E18F9, #37D7FA);
          border-radius: 1px;
          transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav-link:hover {
          color: #000000;
        }
        .nav-link:hover::after,
        .nav-link--active::after {
          width: 100%;
        }
        .nav-link--active {
          color: #000000;
        }

        /* CTA "Let's Talk" button */
        .nav-cta-btn {
          padding: 9px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          background: #000000;
          color: white !important;
          -webkit-text-fill-color: white !important;
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.10);
        }
        .nav-cta-btn:hover {
          background: #3E18F9;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 22px rgba(62, 24, 249, 0.28);
        }

        /* ── MOBILE BOTTOM NAV ── */
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-nav { gap: 16px; }
          .nav-link { font-size: 12.5px; }
        }

        @media (max-width: 768px) {
          .desktop-nav   { display: none; }
          .nav-container { justify-content: center; }

          body { padding-bottom: 80px; }

          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-top: 1px solid #EFEFEF;
            padding: 10px 16px;
            padding-bottom: calc(10px + env(safe-area-inset-bottom));
            justify-content: space-around;
            align-items: center;
            z-index: 1000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
          }

          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            color: #9CA3AF;
            text-decoration: none;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.02em;
            transition: color 0.18s ease, transform 0.18s ease;
            min-width: 44px;
            text-align: center;
          }
          .mobile-nav-item:hover {
            color: #3E18F9;
            transform: translateY(-2px);
          }
          .mobile-nav-item--active {
            color: #3E18F9;
          }
          .mobile-nav-item--active svg {
            filter: drop-shadow(0 0 4px rgba(62, 24, 249, 0.35));
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;