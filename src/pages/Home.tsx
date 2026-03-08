import React from "react";
import HeroSection         from "../components/public/HeroSection";
import AboutSection        from "../components/public/AboutSection";
import ExperienceSection   from "../components/public/Experiencesection";
import TechStackSection    from "../components/public/TechStackSection";
import ProjectsSection     from "../components/public/ProjectsSection";
import CertificatesSection from "../components/public/Certificatessection";
import AchievementsSection from "../components/public/Achievementssection";
import ContactSection      from "../components/public/ContactSection";
import Footer              from "../components/Footer";
import Navbar              from "../components/Navbar";

/*
  HOME SHELL
  ──────────
  • <Navbar /> owns the top bar + mobile bottom nav + active-section tracking.
    There is NO inline navbar code in this file.
  • <Footer /> is rendered ONCE, after </main>.
  • ContactSection does NOT contain any footer/copyright text.
  • Global CSS vars, keyframes, and shared utility classes live in the
    <style> block at the bottom of this file.
*/
const Home: React.FC = () => {
  return (
    <>
      {/* ══ Navbar (top bar + mobile dock) ══ */}
      <Navbar />

      {/* ══ Aurora background blobs ══ */}
      <div className="aurora-container" aria-hidden="true">
        <div className="glow glow-cyan"   />
        <div className="glow glow-purple" />
        <div className="glow glow-pink"   />
      </div>

      {/* ══ Page sections ══ */}
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <TechStackSection />
        <ProjectsSection />
        <CertificatesSection />
        <AchievementsSection />
        <ContactSection />
      </main>

      {/* ══ Footer — SINGLE instance, never duplicated inside any section ══ */}
      <Footer />

      {/* ══ Global styles ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── CSS Variables ── */
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

        /* ── Keyframes ── */
        @keyframes floatGlow    { 0%   { transform: translate(0,0) scale(1);       }
                                  100% { transform: translate(30px,40px) scale(1.1);} }
        @keyframes pulse        { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes gradientShift{ 0%,100%{background-position:0% 50%}  50%{background-position:100% 50%} }
        @keyframes shimmer      { 0%   { transform: translateX(-100%); }
                                  100% { transform: translateX(200%);  } }
        @keyframes scrollLeft   { 0%   { transform: translateX(0);     }
                                  100% { transform: translateX(-50%);  } }
        @keyframes popEffect    { 0%   { opacity:0; transform:scale(.8) translateY(20px); }
                                  100% { opacity:1; transform:scale(1) translateY(0);     } }
        @keyframes certBarPulse { 0%,100%{opacity:.75} 50%{opacity:1} }
        @keyframes certShimmer  { 0%   { transform:translateX(-100%) skewX(-15deg); }
                                  100% { transform:translateX(220%)  skewX(-15deg); } }
        @keyframes certPopin    { 0%   { transform:scale(.80) translateY(14px); opacity:0; }
                                  70%  { transform:scale(1.02); }
                                  100% { transform:none; opacity:1; } }

        /* ── Reset & Base ── */
        *, *::before, *::after { box-sizing: border-box; }
        html  { scroll-behavior: smooth; }
        body  {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: var(--li-bg);
          color: var(--li-text-main);
          overflow-x: hidden;
        }
        h1,h2,h3 { font-weight: 800; letter-spacing: -.03em; margin: 0; }

        /* ── Shared utilities ── */
        .gradient-text {
          background: linear-gradient(90deg, var(--li-purple) 0%, var(--li-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          color: var(--li-text-muted);
          font-size: 16px;
          line-height: 1.65;
          max-width: 580px;
        }
        .mono-text { font-family: 'IBM Plex Mono', monospace; }

        /* Pulsing status dot */
        .dot {
          width: 8px; height: 8px;
          background: #10B981; border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          flex-shrink: 0;
          display: inline-block;
        }

        /* Social chip (used in Hero) */
        .social-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 999px;
          border: 1px solid var(--li-border); background: white;
          font-size: 13px; font-weight: 600; color: var(--li-text-muted);
          text-decoration: none;
          transition: all .2s ease;
        }
        .social-chip:hover {
          border-color: var(--li-purple); color: var(--li-purple);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(62,24,249,.12);
        }

        /* ── Shared button classes ── */
        .primary-btn, .outline-btn {
          padding: 12px 24px; border-radius: 8px;
          font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all .22s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
          display: inline-flex; align-items: center;
          justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif;
        }
        .primary-btn {
          background: var(--li-text-main);
          color: white !important;
          -webkit-text-fill-color: white !important;
          border: none;
          box-shadow: 0 4px 14px rgba(0,0,0,.10);
        }
        .primary-btn:hover {
          background: var(--li-purple);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 22px rgba(62,24,249,.25);
        }
        .outline-btn {
          background: white;
          color: var(--li-text-main) !important;
          border: 1.5px solid var(--li-border);
        }
        .outline-btn:hover {
          border-color: var(--li-text-main);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,.06);
        }

        /* ── Aurora background ── */
        .aurora-container {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100vh;
          overflow: hidden; z-index: 0; pointer-events: none;
        }
        .glow {
          position: absolute; border-radius: 50%;
          filter: blur(140px); opacity: .35; mix-blend-mode: multiply;
          animation: floatGlow 10s ease-in-out infinite alternate;
        }
        .glow-cyan   { width:600px;height:600px; background:var(--li-cyan);  top:-100px; left:10%;  animation-delay: 0s;  }
        .glow-purple { width:500px;height:500px; background:var(--li-purple);top:20%;   left:40%;  opacity:.28; animation-delay:-3s; }
        .glow-pink   { width:550px;height:550px; background:var(--li-pink);  top:10%;   right:10%; opacity:.22; animation-delay:-6s; }

        /* ── Section base ── */
        .section {
          padding: 120px 5%;
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 10;
        }
        .bg-light-grey {
          background: #F7F8FC;
          border-top: 1px solid var(--li-border);
          border-bottom: 1px solid var(--li-border);
        }
        .section-header {
          text-align: center; margin-bottom: 56px; width: 100%;
        }
        .section-header h2 { font-size: clamp(30px,5vw,44px); margin-bottom: 10px; }
        .section-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; font-weight: 800; color: var(--li-purple);
          letter-spacing: .12em; text-transform: uppercase; margin: 0 0 12px;
        }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 120px 5% 80px; position: relative; z-index: 10;
        }
        .hero-content {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1200px; width: 100%; gap: 60px;
        }
        .hero-text {
          flex: 1; display: flex; flex-direction: column;
          align-items: flex-start; max-width: 580px; gap: 16px;
        }
        .hero h1   { font-size: clamp(44px,6vw,76px); line-height: 1.06; font-weight: 900; }
        .tagline-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; background: white;
          border: 1px solid var(--li-border); border-radius: 20px;
          font-size: 13px; font-weight: 600; color: var(--li-text-muted);
          box-shadow: 0 2px 8px rgba(0,0,0,.03);
        }
        .buttons { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-image-container { position: relative; flex: 1; min-height: 480px; }

        /* ── About ── */
        .about-grid {
          display: grid; grid-template-columns: 1fr 1.6fr;
          gap: 60px; max-width: 1100px; width: 100%; align-items: start;
        }
        .about-photo-wrap {
          position: relative; border-radius: 20px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(62,24,249,.12);
        }
        .about-photo       { width:100%; display:block; border-radius:20px; }
        .about-objective   { font-size:18px; font-weight:600; color:var(--li-text-main); line-height:1.6; margin:0 0 16px; border-left:3px solid var(--li-purple); padding-left:16px; }
        .about-bio         { font-size:15px; color:var(--li-text-muted); line-height:1.7; margin:0 0 24px; }
        .about-details     { display:flex; flex-direction:column; gap:12px; margin:0 0 24px; }
        .about-detail-item { display:flex; align-items:flex-start; gap:10px; }
        .about-detail-icon { font-size:16px; flex-shrink:0; margin-top:1px; }
        .about-detail-lbl  { display:block; font-size:11px; font-weight:700; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.05em; font-family:'IBM Plex Mono',monospace; }
        .about-detail-val  { display:block; font-size:14px; font-weight:600; color:var(--li-text-main); }
        .about-detail-link { text-decoration:none; color:var(--li-purple); }
        .about-socials     { display:flex; flex-wrap:wrap; gap:10px; }
        .social-pill {
          padding:8px 16px; border-radius:6px; border:1px solid var(--li-border);
          background:white; font-size:13px; font-weight:700; color:var(--li-text-muted);
          text-decoration:none; transition:all .18s; font-family:'IBM Plex Mono',monospace;
        }
        .social-pill:hover { background:var(--li-purple); color:white; border-color:var(--li-purple); transform:translateY(-2px); }

        /* ── Projects marquee ── */
        .marquee-viewport {
          overflow:hidden; width:100%; max-width:1200px; margin:0 auto;
          position:relative; padding:24px 0;
          -webkit-mask-image:linear-gradient(to right,transparent,black 5%,black 95%,transparent);
          mask-image:linear-gradient(to right,transparent,black 5%,black 95%,transparent);
        }
        .marquee-track         { display:flex; width:max-content; animation:scrollLeft 35s linear infinite; }
        .marquee-track:hover   { animation-play-state:paused; }
        .marquee-item          { width:340px; margin-right:24px; flex-shrink:0; }
        .pop-in                { animation:popEffect .6s cubic-bezier(.34,1.56,.64,1) backwards; }

        .project-card-3d { background:var(--li-card-bg); border-radius:14px; border:1px solid var(--li-border); box-shadow:0 8px 24px rgba(0,0,0,.04); overflow:hidden; display:flex; flex-direction:column; cursor:default; }
        .project-card-3d:hover           { box-shadow:0 20px 48px rgba(62,24,249,.10); }
        .proj-thumb                      { height:180px; overflow:hidden; flex-shrink:0; background:linear-gradient(135deg,rgba(62,24,249,.06),rgba(55,215,250,.06)); }
        .proj-thumb img                  { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s; }
        .project-card-3d:hover .proj-thumb img { transform:scale(1.04); }
        .proj-thumb-placeholder          { display:flex; align-items:center; justify-content:center; font-size:40px; height:180px; }
        .proj-body                       { padding:20px; display:flex; flex-direction:column; gap:10px; flex:1; }
        .proj-complexity                 { display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.05em; align-self:flex-start; }
        .proj-cx-1                       { background:rgba(148,163,184,.12); color:#64748b; }
        .proj-cx-2                       { background:rgba(245,158,11,.12);  color:#b45309; }
        .proj-cx-3                       { background:rgba(62,24,249,.10);   color:var(--li-purple); }
        .proj-title                      { font-size:17px; font-weight:800; margin:0; letter-spacing:-.02em; }
        .proj-desc                       { font-size:13px; color:var(--li-text-muted); margin:0; line-height:1.55; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .proj-tech-row                   { display:flex; flex-wrap:wrap; gap:5px; }
        .proj-tech-chip                  { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; padding:3px 8px; border-radius:4px; background:rgba(15,23,42,.04); border:1px solid var(--li-border); color:var(--li-text-muted); }
        .proj-tags                       { display:flex; flex-wrap:wrap; gap:5px; }
        .proj-tag                        { font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; background:rgba(62,24,249,.07); color:var(--li-purple); border:1px solid rgba(62,24,249,.15); font-family:'IBM Plex Mono',monospace; }
        .proj-links                      { display:flex; gap:8px; margin-top:auto; padding-top:4px; }
        .proj-link                       { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; text-decoration:none; transition:all .18s; border:1px solid; }
        .proj-link-gh                    { color:var(--li-text-muted); border-color:var(--li-border); background:transparent; }
        .proj-link-gh:hover              { color:var(--li-text-main); border-color:var(--li-text-main); transform:translateY(-1px); }
        .proj-link-live                  { color:var(--li-purple); border-color:rgba(62,24,249,.25); background:rgba(62,24,249,.05); }
        .proj-link-live:hover            { background:rgba(62,24,249,.12); transform:translateY(-1px); }

        /* ── Certificates ── */
        .cert-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        .cert-stat  { background:white; border:1px solid var(--li-border); border-radius:14px; padding:18px 20px; display:flex; flex-direction:column; gap:4px; box-shadow:0 4px 12px rgba(2,6,23,.04); animation:certPopin .45s cubic-bezier(.34,1.56,.64,1) both; transition:transform .20s,box-shadow .20s; }
        .cert-stat:hover  { transform:translateY(-3px); box-shadow:0 12px 28px rgba(62,24,249,.10); }
        .cert-stat__icon  { font-size:22px; margin-bottom:2px; }
        .cert-stat__val   { font-size:28px; font-weight:900; letter-spacing:-.04em; line-height:1; }
        .cert-stat__lbl   { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.07em; }
        .certs-grid       { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:20px; align-items:start; }
        .cert-card        { background:white; border-radius:16px; border:1px solid var(--li-border); box-shadow:0 6px 22px rgba(2,6,23,.05); display:flex; flex-direction:column; overflow:hidden; cursor:default; transition:box-shadow .22s,transform .20s; }
        .cert-card:hover  { box-shadow:0 22px 52px rgba(62,24,249,.12); }
        .cert-card--expired { opacity:.65; filter:saturate(.5); }
        .cert-topbar      { height:3px; flex-shrink:0; background:linear-gradient(90deg,var(--li-purple),var(--li-cyan)); position:relative; overflow:hidden; animation:certBarPulse 3s ease-in-out infinite; }
        .cert-topbar::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent); animation:certShimmer 2.5s ease-in-out infinite; }
        .cert-topbar--gold { background:linear-gradient(90deg,#f59e0b,#fbbf24); }
        .cert-thumb { height:140px; overflow:hidden; flex-shrink:0; position:relative; background:linear-gradient(135deg,rgba(62,24,249,.06),rgba(55,215,250,.06)); }
        .cert-thumb__img  { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s; }
        .cert-card:hover .cert-thumb__img { transform:scale(1.05); }
        .cert-thumb__placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:38px; }
        .cert-badge       { position:absolute; font-size:10px; font-weight:800; padding:4px 9px; border-radius:999px; font-family:'IBM Plex Mono',monospace; }
        .cert-badge--feat  { top:10px; left:10px;  background:rgba(245,158,11,.90); color:#78350f; }
        .cert-badge--exp   { top:10px; right:10px; background:rgba(239,68,68,.90);  color:#fff; }
        .cert-badge--valid { top:10px; right:10px; background:rgba(34,197,94,.90);  color:#fff; }
        .cert-body        { padding:16px; display:flex; flex-direction:column; gap:8px; flex:1; }
        .cert-name        { font-size:15px; font-weight:800; margin:0; line-height:1.3; letter-spacing:-.02em; }
        .cert-org         { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700; color:var(--li-purple); margin:0; }
        .cert-desc        { font-size:12px; color:var(--li-text-muted); margin:0; line-height:1.55; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .cert-dates       { display:flex; flex-direction:column; gap:4px; }
        .cert-date-row    { display:flex; align-items:center; justify-content:space-between; gap:6px; }
        .cert-date-lbl    { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; color:var(--li-text-muted); }
        .cert-date-val    { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800; color:var(--li-text-main); }
        .cert-date-row--exp .cert-date-val { color:#ef4444; }
        .cert-cred-id     { display:flex; align-items:center; gap:5px; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; color:var(--li-text-muted); background:rgba(15,23,42,.04); padding:5px 9px; border-radius:6px; border:1px solid var(--li-border); word-break:break-all; }
        .cert-footer      { display:flex; gap:8px; padding:10px 14px; border-top:1px solid var(--li-border); }
        .cert-btn         { display:inline-flex; align-items:center; gap:4px; padding:6px 13px; border-radius:6px; font-size:11px; font-weight:800; text-decoration:none; font-family:'IBM Plex Mono',monospace; transition:all .18s; border:1px solid; }
        .cert-btn--verify { color:var(--li-purple); border-color:rgba(62,24,249,.25); background:rgba(62,24,249,.05); }
        .cert-btn--verify:hover { background:rgba(62,24,249,.13); transform:translateY(-1px); }
        .cert-btn--view   { color:var(--li-text-muted); border-color:var(--li-border); background:transparent; }
        .cert-btn--view:hover { color:var(--li-text-main); border-color:rgba(15,23,42,.3); transform:translateY(-1px); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .about-grid  { grid-template-columns:1fr; gap:40px; }
          .cert-stats  { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width: 900px) {
          .hero-content { flex-direction:column; text-align:center; gap:48px; }
          .hero-text    { align-items:center; max-width:100%; }
          .buttons      { justify-content:center; }
        }
        @media (max-width: 768px) {
          .section { padding:80px 5%; }
        }
        @media (max-width: 600px) {
          .cert-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
          .certs-grid { grid-template-columns:1fr; }
        }
        @media (max-width: 480px) {
          .hero         { padding-top:100px; }
          .hero h1      { font-size:38px; }
          .hero-image-container { display:none; }
          .glow-cyan    { width:300px; height:300px; }
          .glow-purple  { width:250px; height:250px; }
          .glow-pink    { width:250px; height:250px; }
        }
      `}</style>
    </>
  );
};

export default Home;