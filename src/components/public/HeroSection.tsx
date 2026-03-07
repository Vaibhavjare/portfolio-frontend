import { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";
import { useGetProfileQuery }      from "../../redux/services/profileApi";
import { useGetProjectsQuery }     from "../../redux/services/projectApi";
import { useGetSkillsQuery }       from "../../redux/services/skillApi";
import { useGetCertificatesQuery } from "../../redux/services/certificateApi";

/* ─── Animated counter ─── */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || ran.current) return;
      ran.current = true; obs.disconnect();
      let cur = 0;
      const tick = () => {
        cur += Math.max(1, Math.ceil(to / 40));
        if (cur >= to) { setVal(to); return; }
        setVal(cur); requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
};

const HeroSection = () => {
  const { data: profile }       = useGetProfileQuery();
  const { data: projects = [] } = useGetProjectsQuery({});
  const { data: skills   = [] } = useGetSkillsQuery({});
  const { data: certs    = [] } = useGetCertificatesQuery({});

  const [splineLoaded, setSplineLoaded] = useState(false);
  const [visible, setVisible]           = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* Entrance */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* Scroll parallax */
  useEffect(() => {
    const onScroll = () => {
      const hero = sectionRef.current; if (!hero) return;
      const y   = window.scrollY;
      const txt = hero.querySelector<HTMLElement>(".hero-text");
      const img = hero.querySelector<HTMLElement>(".hero-image-container");
      if (txt) txt.style.transform = `translateY(${y * 0.10}px)`;
      if (img) img.style.transform = `translateY(${y * 0.05}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name      = profile?.full_name || "Vaibhav Jare";
  const bio       = profile?.bio || profile?.objective
    || "Building intelligent, scalable, and high-performance applications. Specializing in reasoning systems, LLMs, and robust backend architecture.";
  const expYrs    = profile?.experience_years;
  const resumeUrl = profile?.resume_url;
  const github    = profile?.social_links?.github;

  return (
    <section ref={sectionRef} className="hero" id="home">
      <div className={`hero-content${visible ? " hs-ready" : ""}`}>

        {/* ══ LEFT ══ */}
        <div className="hero-text">

          <div className="tagline-badge hs-anim" style={{ "--d": "0s" } as React.CSSProperties}>
            <span className="dot" />
            {expYrs ? `${expYrs}+ Years of Experience` : "Open for Freelance Projects"}
          </div>

          <h1 className="hs-anim" style={{ "--d": "0.10s" } as React.CSSProperties}>
            Hi, I'm <br />
            <span className="gradient-text hs-grad-loop">{name}</span>
          </h1>

          <div className="roles-scroller hs-anim" style={{ "--d": "0.17s" } as React.CSSProperties}>
            <div className="roles-track">
              {[
                profile?.title || "Agentic AI Developer",
                "Gen AI Developer",
                "Full Stack Developer",
                profile?.title || "Agentic AI Developer",
                "Gen AI Developer",
                "Full Stack Developer",
              ].map((r, i) => (
                <span key={i}>
                  {i > 0 && <span className="separator">•</span>}
                  {r}
                </span>
              ))}
            </div>
          </div>

          <p className="subtitle hs-anim" style={{ "--d": "0.24s" } as React.CSSProperties}>
            {bio}
          </p>

          <div className="buttons hs-anim" style={{ "--d": "0.32s" } as React.CSSProperties}>
            <a href="#portfolio" className="primary-btn hs-btn-glow">View Projects</a>
            {resumeUrl
              ? <a href={resumeUrl} target="_blank" rel="noreferrer" className="outline-btn">Download Resume ↓</a>
              : <a href="#contact" className="outline-btn">Contact Me</a>
            }
            {github && (
              <a href={github} target="_blank" rel="noreferrer" className="outline-btn hs-icon-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
          </div>

          {/* Stats */}
          {(projects.length > 0 || skills.length > 0) && (
            <div className="hs-stats hs-anim" style={{ "--d": "0.40s" } as React.CSSProperties}>
              {projects.length > 0 && (
                <div className="hs-stat">
                  <span className="hs-stat-num gradient-text"><Counter to={projects.length} suffix="+" /></span>
                  <span className="hs-stat-lbl">Projects</span>
                </div>
              )}
              {skills.length > 0 && (
                <div className="hs-stat">
                  <span className="hs-stat-num gradient-text"><Counter to={skills.length} suffix="+" /></span>
                  <span className="hs-stat-lbl">Skills</span>
                </div>
              )}
              {expYrs != null && expYrs > 0 && (
                <div className="hs-stat">
                  <span className="hs-stat-num gradient-text"><Counter to={expYrs} suffix="+" /></span>
                  <span className="hs-stat-lbl">Yrs Exp</span>
                </div>
              )}
              {certs.length > 0 && (
                <div className="hs-stat">
                  <span className="hs-stat-num gradient-text"><Counter to={certs.length} /></span>
                  <span className="hs-stat-lbl">Certs</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ RIGHT — Spline 3D ══ */}
        <div className="hero-image-container hs-anim-right" style={{ "--d": "0.08s" } as React.CSSProperties}>

          {/* Floating live data badges */}
          <div className="hs-float-badge" style={{ top: "6%", left: "-10%", animationDelay: "0s" }}>
            ⚡ {skills.length} Skills
          </div>
          <div className="hs-float-badge" style={{ top: "20%", right: "-12%", animationDelay: "0.9s" }}>
            🚀 {projects.length} Projects
          </div>
          {certs.length > 0 && (
            <div className="hs-float-badge" style={{ bottom: "30%", right: "-10%", animationDelay: "1.8s" }}>
              🎓 {certs.length} Certs
            </div>
          )}
          {profile?.location && (
            <div className="hs-float-badge" style={{ bottom: "10%", left: "-8%", animationDelay: "2.7s" }}>
              📍 {profile.location}
            </div>
          )}

          {/* Decorative rotating rings */}
          <div className="hs-ring hs-ring-1" />
          <div className="hs-ring hs-ring-2" />
          <div className="hs-ring hs-ring-3" />

          <div className="spline-wrapper">
            {!splineLoaded && (
              <div className="spline-loading">
                <span className="hs-dot-a" />
                <span className="hs-dot-a" style={{ animationDelay: "0.16s" }} />
                <span className="hs-dot-a" style={{ animationDelay: "0.32s" }} />
                <span style={{ marginLeft: 10 }}>Loading 3D Environment...</span>
              </div>
            )}
            <Spline
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
              className="spline-canvas"
              onLoad={() => setSplineLoaded(true)}
              style={{ opacity: splineLoaded ? 1 : 0, transition: "opacity 0.8s ease" }}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hs-scroll-cue">
        <div className="hs-mouse"><div className="hs-wheel" /></div>
        <span>Scroll to explore</span>
      </div>

      <style>{`
        @keyframes hs-up    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hs-right { from{opacity:0;transform:translateX(55px)} to{opacity:1;transform:translateX(0)} }
        @keyframes hs-badge { 0%,100%{transform:translateY(0)rotate(-1.5deg)} 50%{transform:translateY(-12px)rotate(1.5deg)} }
        @keyframes hs-grad  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes hs-roles { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes hs-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(62,24,249,0.40)} 60%{box-shadow:0 0 0 14px rgba(62,24,249,0)} }
        @keyframes hs-wheel { 0%{opacity:1;top:5px} 100%{opacity:0;top:15px} }
        @keyframes hs-dot   { 0%,80%,100%{transform:scale(0);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes hs-spin  { from{transform:translate(-50%,-50%)rotate(0deg)} to{transform:translate(-50%,-50%)rotate(360deg)} }
        @keyframes hs-count { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

        /* Entrance system */
        .hs-anim       { opacity:0; }
        .hs-anim-right { opacity:0; }
        .hs-ready .hs-anim       { animation:hs-up    0.60s cubic-bezier(.22,1,.36,1) var(--d,0s) both; }
        .hs-ready .hs-anim-right { animation:hs-right 0.70s cubic-bezier(.22,1,.36,1) var(--d,0s) both; }

        /* Looping gradient on name */
        .hs-grad-loop {
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan),var(--li-pink),var(--li-purple));
          background-size:300% 100%;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:hs-grad 5s ease infinite;
        }

        /* Roles ticker */
        .roles-scroller {
          overflow:hidden; white-space:nowrap; margin-bottom:18px;
          mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);
          -webkit-mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);
        }
        .roles-track {
          display:inline-flex; gap:18px; align-items:center;
          animation:hs-roles 20s linear infinite;
          font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:700;
          color:var(--li-text-muted);
        }
        .roles-track:hover { animation-play-state:paused; }
        .separator { color:var(--li-cyan); font-size:20px; }

        /* Floating badges */
        .hs-float-badge {
          position:absolute;
          background:rgba(255,255,255,0.90); backdrop-filter:blur(14px);
          border:1px solid var(--li-border); border-radius:999px;
          font-size:12px; font-weight:800; padding:8px 16px;
          white-space:nowrap; box-shadow:0 8px 28px rgba(0,0,0,0.10);
          z-index:6; font-family:'IBM Plex Mono',monospace;
          animation:hs-badge 5s ease-in-out infinite; pointer-events:none;
        }

        /* Rotating decorative rings */
        .hs-ring {
          position:absolute; border-radius:50%;
          top:50%; left:50%;
          border-style:dashed; pointer-events:none; z-index:1;
        }
        .hs-ring-1 { width:540px;height:540px; transform:translate(-50%,-50%); border-width:1.5px; border-color:rgba(62,24,249,0.14); animation:hs-spin 30s linear infinite; }
        .hs-ring-2 { width:390px;height:390px; transform:translate(-50%,-50%); border-width:1.5px; border-color:rgba(55,215,250,0.18); animation:hs-spin 20s linear infinite reverse; }
        .hs-ring-3 { width:260px;height:260px; transform:translate(-50%,-50%); border-width:1px;   border-color:rgba(255,141,242,0.16); animation:hs-spin 14s linear infinite; }

        /* hero-image-container must be position:relative */
        .hero-image-container { position:relative; }

        /* Button glow pulse */
        .hs-btn-glow { animation:hs-glow 2.8s ease infinite 1.8s; }
        .hs-icon-btn { display:inline-flex; align-items:center; gap:7px; }

        /* Stats row */
        .hs-stats {
          display:flex; gap:36px; flex-wrap:wrap;
          margin-top:30px; padding-top:26px;
          border-top:1px solid var(--li-border);
        }
        .hs-stat { display:flex; flex-direction:column; gap:4px; }
        .hs-stat-num {
          font-size:34px; font-weight:900; letter-spacing:-0.04em; line-height:1;
          animation:hs-count 0.6s cubic-bezier(.34,1.56,.64,1) both;
        }
        .hs-stat-lbl {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--li-text-muted); text-transform:uppercase; letter-spacing:0.10em;
        }

        /* Loader dots */
        .hs-dot-a {
          display:inline-block; width:6px; height:6px; border-radius:50%;
          background:var(--li-purple); margin:0 2px;
          animation:hs-dot 1.2s ease-in-out infinite;
        }

        /* Spline */
        .spline-wrapper { position:relative; width:100%; height:100%; border-radius:20px; overflow:hidden; }
        .spline-loading {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--li-text-muted);
          z-index:2; display:flex; align-items:center;
        }
        .spline-canvas { position:relative;z-index:3;width:100%!important;height:100%!important;cursor:grab; }
        .spline-canvas:active { cursor:grabbing; }

        /* Scroll cue */
        .hs-scroll-cue {
          position:absolute; bottom:28px; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:8px;
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700;
          color:var(--li-text-muted); letter-spacing:0.08em;
          animation:hs-up 1s ease 1.6s both;
        }
        .hs-mouse {
          width:22px; height:35px; border:2px solid rgba(62,24,249,0.28);
          border-radius:999px; position:relative; overflow:hidden;
        }
        .hs-wheel {
          position:absolute; top:5px; left:50%; transform:translateX(-50%);
          width:4px; height:8px; border-radius:999px; background:var(--li-purple);
          animation:hs-wheel 1.6s ease-in-out infinite;
        }

        @media (max-width:900px) {
          .hs-float-badge,.hs-ring,.hs-scroll-cue { display:none; }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;