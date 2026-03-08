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
  const [visible,      setVisible]      = useState(false);
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
  const linkedin  = profile?.social_links?.linkedin;

  return (
    <section ref={sectionRef} className="hero" id="home">
      <div className={`hero-content${visible ? " hs-ready" : ""}`}>

        {/* ══ LEFT ══ */}
        <div className="hero-text">

          {/* Badge */}
          <div className="tagline-badge hs-anim" style={{ "--d": "0s" } as React.CSSProperties}>
            <span className="dot" />
            {expYrs ? `${expYrs}+ Years of Experience` : "Open for Freelance Projects"}
          </div>

          {/* Heading */}
          <h1 className="hs-anim" style={{ "--d": "0.10s" } as React.CSSProperties}>
            Hi, I'm <br />
            <span className="gradient-text hs-grad-loop">{name}</span>
          </h1>

          {/* Roles scroller */}
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
                  {i > 0 && <span className="separator">|</span>}
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <p className="subtitle hs-anim" style={{ "--d": "0.24s" } as React.CSSProperties}>
            {bio}
          </p>

          {/* Social chips row */}
          <div className="hs-social-row hs-anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            {github && (
              <a href={github} target="_blank" rel="noreferrer" className="social-chip">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="social-chip">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="buttons hs-anim" style={{ "--d": "0.34s" } as React.CSSProperties}>
            {/* Primary CTA */}
            <a href="#portfolio" className="hs-btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              View My Work
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hs-btn-arrow" aria-hidden="true">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </a>

            {/* Resume / Contact outline */}
            {resumeUrl
              ? (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="hs-btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Download Resume
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </a>
              ) : (
                <a href="#contact" className="hs-btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Contact Me
                </a>
              )
            }
          </div>

          {/* Stats */}
          {(projects.length > 0 || skills.length > 0) && (
            <div className="hs-stats hs-anim" style={{ "--d": "0.42s" } as React.CSSProperties}>
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

          {/* Floating badges */}
          <div className="hs-float-badge" style={{ top:"6%", left:"-10%", animationDelay:"0s" }}>
            ⚡ {skills.length} Skills
          </div>
          <div className="hs-float-badge" style={{ top:"20%", right:"-12%", animationDelay:"0.9s" }}>
            🚀 {projects.length} Projects
          </div>
          {certs.length > 0 && (
            <div className="hs-float-badge" style={{ bottom:"30%", right:"-10%", animationDelay:"1.8s" }}>
              🎓 {certs.length} Certs
            </div>
          )}
          {profile?.location && (
            <div className="hs-float-badge" style={{ bottom:"10%", left:"-8%", animationDelay:"2.7s" }}>
              📍 {profile.location}
            </div>
          )}

          {/* Decorative rings */}
          <div className="hs-ring hs-ring-1" />
          <div className="hs-ring hs-ring-2" />
          <div className="hs-ring hs-ring-3" />

          <div className="spline-wrapper">
            {!splineLoaded && (
              <div className="spline-loading">
                <span className="hs-dot-a" />
                <span className="hs-dot-a" style={{ animationDelay:"0.16s" }} />
                <span className="hs-dot-a" style={{ animationDelay:"0.32s" }} />
                <span style={{ marginLeft:10 }}>Loading 3D Environment...</span>
              </div>
            )}
            <Spline
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
              className="spline-canvas"
              onLoad={() => setSplineLoaded(true)}
              style={{ opacity: splineLoaded ? 1 : 0, transition:"opacity 0.8s ease" }}
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
        @keyframes hs-badge { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(-12px) rotate(1.5deg)} }
        @keyframes hs-grad  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes hs-roles { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes hs-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(62,24,249,.40)} 60%{box-shadow:0 0 0 16px rgba(62,24,249,0)} }
        @keyframes hs-wheel { 0%{opacity:1;top:5px} 100%{opacity:0;top:16px} }
        @keyframes hs-dot   { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        @keyframes hs-spin  { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes hs-count { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes hs-btn-ripple { 0%{transform:scale(0);opacity:.6} 100%{transform:scale(2.5);opacity:0} }
        @keyframes hs-btn-shine  { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(220%) skewX(-15deg)} }

        /* Entrance */
        .hs-anim       { opacity:0; }
        .hs-anim-right { opacity:0; }
        .hs-ready .hs-anim       { animation:hs-up    0.60s cubic-bezier(.22,1,.36,1) var(--d,0s) both; }
        .hs-ready .hs-anim-right { animation:hs-right 0.70s cubic-bezier(.22,1,.36,1) var(--d,0s) both; }

        /* Gradient name loop */
        .hs-grad-loop {
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan),var(--li-pink),var(--li-purple));
          background-size:300% 100%;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:hs-grad 5s ease infinite;
        }

        /* Social chips */
        .hs-social-row { display:flex; gap:10px; flex-wrap:wrap; }

        /* ── CTA Buttons ── */
        .hs-btn-primary, .hs-btn-outline {
          display:inline-flex; align-items:center; gap:8px;
          padding:13px 24px; border-radius:10px;
          font-weight:800; font-size:15px; text-decoration:none;
          font-family:'Inter',sans-serif; cursor:pointer;
          position:relative; overflow:hidden;
          transition:all .28s cubic-bezier(.34,1.56,.64,1);
        }
        /* Primary */
        .hs-btn-primary {
          background:var(--li-text-main); color:white; border:none;
          box-shadow:0 6px 22px rgba(0,0,0,.14);
          animation:hs-glow 3s ease infinite 2s;
        }
        .hs-btn-primary::before {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
          transform:translateX(-100%) skewX(-15deg);
          animation:hs-btn-shine 3.5s ease-in-out infinite;
        }
        .hs-btn-primary:hover {
          background:var(--li-purple);
          transform:translateY(-3px) scale(1.03);
          box-shadow:0 14px 36px rgba(62,24,249,.35);
        }
        .hs-btn-primary:active { transform:scale(.97); }

        /* Outline */
        .hs-btn-outline {
          background:white; color:var(--li-text-main);
          border:1.5px solid var(--li-border);
          box-shadow:0 4px 12px rgba(0,0,0,.05);
        }
        .hs-btn-outline:hover {
          border-color:var(--li-text-main);
          transform:translateY(-3px) scale(1.02);
          box-shadow:0 10px 28px rgba(0,0,0,.10);
        }
        .hs-btn-outline:active { transform:scale(.97); }

        /* Arrow animates on hover */
        .hs-btn-arrow { transition:transform .22s ease; }
        .hs-btn-primary:hover .hs-btn-arrow { transform:translateX(4px); }

        /* Roles scroller */
        .roles-scroller {
          overflow:hidden; width:100%;
          -webkit-mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);
          mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);
        }
        .roles-track {
          display:inline-flex; gap:18px; align-items:center;
          animation:hs-roles 20s linear infinite;
          font-family:'IBM Plex Mono',monospace; font-size:14px; font-weight:700;
          color:var(--li-text-muted);
        }
        .roles-track:hover { animation-play-state:paused; }
        .separator { color:var(--li-cyan); font-size:18px; margin:0 4px; }

        /* Floating badges */
        .hs-float-badge {
          position:absolute;
          background:rgba(255,255,255,.92); backdrop-filter:blur(14px);
          border:1px solid var(--li-border); border-radius:999px;
          font-size:12px; font-weight:800; padding:8px 16px;
          white-space:nowrap; box-shadow:0 8px 28px rgba(0,0,0,.10);
          z-index:6; font-family:'IBM Plex Mono',monospace;
          animation:hs-badge 5s ease-in-out infinite; pointer-events:none;
        }

        /* Rings */
        .hs-ring { position:absolute; border-radius:50%; top:50%; left:50%; border-style:dashed; pointer-events:none; z-index:1; }
        .hs-ring-1 { width:540px; height:540px; transform:translate(-50%,-50%); border-width:1.5px; border-color:rgba(62,24,249,.14);  animation:hs-spin 30s linear infinite; }
        .hs-ring-2 { width:390px; height:390px; transform:translate(-50%,-50%); border-width:1.5px; border-color:rgba(55,215,250,.18);  animation:hs-spin 20s linear infinite reverse; }
        .hs-ring-3 { width:260px; height:260px; transform:translate(-50%,-50%); border-width:1px;   border-color:rgba(255,141,242,.16); animation:hs-spin 14s linear infinite; }

        .hero-image-container { position:relative; }

        /* Stats */
        .hs-stats { display:flex; gap:36px; flex-wrap:wrap; margin-top:30px; padding-top:26px; border-top:1px solid var(--li-border); }
        .hs-stat  { display:flex; flex-direction:column; gap:4px; }
        .hs-stat-num { font-size:34px; font-weight:900; letter-spacing:-.04em; line-height:1; animation:hs-count .6s cubic-bezier(.34,1.56,.64,1) both; }
        .hs-stat-lbl { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.10em; }

        /* Loader dots */
        .hs-dot-a { display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--li-purple); margin:0 2px; animation:hs-dot 1.2s ease-in-out infinite; }

        /* Spline */
        .spline-wrapper  { position:relative; width:100%; height:100%; border-radius:20px; overflow:hidden; }
        .spline-loading  { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--li-text-muted); z-index:2; display:flex; align-items:center; }
        .spline-canvas   { position:relative; z-index:3; width:100%!important; height:100%!important; cursor:grab; }
        .spline-canvas:active { cursor:grabbing; }

        /* Scroll cue */
        .hs-scroll-cue {
          position:absolute; bottom:28px; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:8px;
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700;
          color:var(--li-text-muted); letter-spacing:.08em;
          animation:hs-up 1s ease 1.6s both;
        }
        .hs-mouse { width:22px; height:35px; border:2px solid rgba(62,24,249,.28); border-radius:999px; position:relative; overflow:hidden; }
        .hs-wheel { position:absolute; top:5px; left:50%; transform:translateX(-50%); width:4px; height:8px; border-radius:999px; background:var(--li-purple); animation:hs-wheel 1.6s ease-in-out infinite; }

        @media(max-width:900px) { .hs-float-badge,.hs-ring,.hs-scroll-cue { display:none; } }
        @media(max-width:480px) { .hs-btn-primary,.hs-btn-outline { width:100%; justify-content:center; } .buttons { flex-direction:column; } }
      `}</style>
    </section>
  );
};

export default HeroSection;