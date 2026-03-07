import { useEffect, useRef, useState } from "react";
import { useGetProfileQuery } from "../../redux/services/profileApi";

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children, delay = 0, from = "bottom", className = "", style = {},
}: {
  children: React.ReactNode; delay?: number;
  from?: "bottom" | "left" | "right"; className?: string; style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const hidden = {
    bottom: "translateY(36px)",
    left:   "translateX(-40px)",
    right:  "translateX(40px)",
  }[from];
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : hidden,
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── 3D Tilt card ─── */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
    el.style.boxShadow = `${-x * 20}px ${-y * 20}px 48px rgba(62,24,249,0.14)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateZ(0)";
    el.style.boxShadow = "";
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: "transform 0.20s ease, box-shadow 0.20s ease", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

/* ─── Animated progress bar ─── */
const ProgressBar = ({ pct, color, delay }: { pct: number; color: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(pct), delay * 1000); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{
      height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", width: `${w}%`, background: color,
        borderRadius: 999, transition: "width 0.9s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)",
          animation: "ab-shimmer 1.8s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
};

const PROF_PCT: Record<string, number> = {
  Beginner: 20, Elementary: 40, Intermediate: 60, Advanced: 80, Expert: 100,
};
const PROF_COL: Record<string, string> = {
  Beginner: "#94a3b8", Elementary: "#38bdf8", Intermediate: "#f59e0b",
  Advanced: "#22c55e", Expert: "#3E18F9",
};

const AboutSection = () => {
  const { data: profile, isLoading } = useGetProfileQuery();

  const name     = profile?.full_name || "Vaibhav Jare";
  const title    = profile?.title     || "Agentic AI Developer";
  const obj      = profile?.objective || "";
  const bio      = profile?.bio       || "";
  const location = profile?.location  || "";
  const email    = profile?.email     || "";
  const phone    = profile?.phone     || "";
  const expYrs   = profile?.experience_years;
  const photo    = profile?.profile_photo;
  const summary  = profile?.skills_summary || "";
  const social   = profile?.social_links   || {};
  const resume   = profile?.resume_url;

  return (
    <section className="section" id="about">
      <Reveal className="section-header">
        <h2>About <span className="gradient-text">Me</span></h2>
        <p className="subtitle">
          {obj || "I bridge the gap between complex AI models and production-ready applications."}
        </p>
      </Reveal>

      <div className="ab-grid">

        {/* ══ LEFT — 3D photo card ══ */}
        <Reveal from="left" delay={0.1} className="ab-left">
          <TiltCard className="ab-photo-wrap">
            {/* Gradient frame */}
            <div className="ab-photo-frame" />

            {photo ? (
              <img src={photo} alt={name} className="ab-photo" />
            ) : (
              <div className="ab-photo-placeholder">
                <span className="gradient-text">{name.charAt(0)}</span>
              </div>
            )}

            {/* Floating name plate */}
            <div className="ab-nameplate">
              <p className="ab-nameplate-name">{name}</p>
              <p className="ab-nameplate-title">{title}</p>
            </div>

            {/* Experience badge */}
            {expYrs != null && expYrs > 0 && (
              <div className="ab-exp-badge">
                <span className="ab-exp-num gradient-text">{expYrs}+</span>
                <span className="ab-exp-lbl">Years Exp</span>
              </div>
            )}

            {/* Orbiting dots */}
            <div className="ab-orbit ab-orbit-1"><div className="ab-orbit-dot" /></div>
            <div className="ab-orbit ab-orbit-2"><div className="ab-orbit-dot ab-orbit-dot-cyan" /></div>
          </TiltCard>

          {/* Social pills below photo */}
          <div className="ab-social-row">
            {social.github   && <a href={social.github}   target="_blank" rel="noreferrer" className="ab-social-pill ab-pill-gh">GitHub</a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="ab-social-pill ab-pill-li">LinkedIn</a>}
            {social.twitter  && <a href={social.twitter}  target="_blank" rel="noreferrer" className="ab-social-pill">Twitter</a>}
            {social.instagram&& <a href={social.instagram}target="_blank" rel="noreferrer" className="ab-social-pill ab-pill-ig">Instagram</a>}
            {resume          && <a href={resume}          target="_blank" rel="noreferrer" className="ab-social-pill ab-pill-resume">Resume ↓</a>}
          </div>
        </Reveal>

        {/* ══ RIGHT — info ══ */}
        <div className="ab-right">

          {/* Bio block */}
          {bio && bio !== obj && (
            <Reveal delay={0.15}>
              <div className="ab-bio-block">
                <div className="ab-bio-bar" />
                <p className="ab-bio-text">{bio}</p>
              </div>
            </Reveal>
          )}

          {/* Skills summary */}
          {summary && (
            <Reveal delay={0.20}>
              <p className="ab-summary">{summary}</p>
            </Reveal>
          )}

          {/* Detail chips */}
          <Reveal delay={0.22}>
            <div className="ab-details">
              {location && (
                <div className="ab-detail">
                  <span className="ab-detail-ico">📍</span>
                  <div>
                    <span className="ab-detail-lbl">Location</span>
                    <span className="ab-detail-val">{location}</span>
                  </div>
                </div>
              )}
              {email && (
                <div className="ab-detail">
                  <span className="ab-detail-ico">✉️</span>
                  <div>
                    <span className="ab-detail-lbl">Email</span>
                    <a href={`mailto:${email}`} className="ab-detail-val ab-detail-link">{email}</a>
                  </div>
                </div>
              )}
              {phone && (
                <div className="ab-detail">
                  <span className="ab-detail-ico">📞</span>
                  <div>
                    <span className="ab-detail-lbl">Phone</span>
                    <span className="ab-detail-val">{phone}</span>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* What I do — 3D tilt feature cards */}
          <Reveal delay={0.28}>
            <p className="ab-section-label">WHAT I DO</p>
          </Reveal>
          <div className="ab-feature-grid">
            {[
              { icon: "🤖", title: "Agentic AI",    desc: "Autonomous reasoning systems, multi-agent frameworks, LLM orchestration." },
              { icon: "🌐", title: "Full Stack",     desc: "React, TypeScript, FastAPI, Node — end-to-end web applications." },
              { icon: "🧠", title: "Gen AI",         desc: "RAG pipelines, fine-tuning, embedding systems, vector databases." },
              { icon: "☁️", title: "Cloud & DevOps", desc: "Containerized deploys, CI/CD, scalable microservices on cloud." },
            ].map(({ icon, title: t, desc }, i) => (
              <Reveal key={t} delay={0.30 + i * 0.07}>
                <TiltCard className="ab-feature-card">
                  <div className="ab-feature-icon">{icon}</div>
                  <h4 className="ab-feature-title">{t}</h4>
                  <p className="ab-feature-desc">{desc}</p>
                  <div className="ab-feature-shine" />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ab-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes ab-orbit1  { from{transform:rotate(0deg)   translateX(90px) rotate(0deg)}   to{transform:rotate(360deg)  translateX(90px) rotate(-360deg)}  }
        @keyframes ab-orbit2  { from{transform:rotate(180deg) translateX(120px) rotate(-180deg)} to{transform:rotate(540deg) translateX(120px) rotate(-540deg)} }
        @keyframes ab-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ab-pop     { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }

        .ab-grid {
          display:grid; grid-template-columns:380px 1fr;
          gap:60px; max-width:1100px; width:100%; align-items:start;
        }

        /* ── Photo card ── */
        .ab-photo-wrap {
          position:relative; border-radius:22px;
          overflow:visible; /* orbits go outside */
          cursor:default;
        }
        .ab-photo-frame {
          position:absolute; inset:-3px; border-radius:25px;
          background:linear-gradient(135deg,var(--li-purple),var(--li-cyan),var(--li-pink));
          z-index:0; opacity:0.55;
        }
        .ab-photo {
          width:100%; display:block; border-radius:20px;
          position:relative; z-index:1; aspect-ratio:4/5; object-fit:cover;
        }
        .ab-photo-placeholder {
          width:100%; aspect-ratio:4/5; border-radius:20px;
          background:linear-gradient(135deg,rgba(62,24,249,0.08),rgba(55,215,250,0.08));
          display:flex; align-items:center; justify-content:center;
          font-size:80px; font-weight:900; position:relative; z-index:1;
        }

        /* Nameplate overlay */
        .ab-nameplate {
          position:absolute; bottom:0; left:0; right:0; z-index:3;
          background:rgba(255,255,255,0.88); backdrop-filter:blur(14px);
          padding:14px 18px; border-radius:0 0 20px 20px;
          border-top:1px solid rgba(255,255,255,0.5);
        }
        .ab-nameplate-name  { font-size:16px; font-weight:900; margin:0 0 3px; letter-spacing:-0.02em; }
        .ab-nameplate-title { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700; color:var(--li-purple); margin:0; }

        /* Experience badge */
        .ab-exp-badge {
          position:absolute; top:-16px; right:-16px; z-index:5;
          background:white; border:1px solid var(--li-border);
          border-radius:14px; padding:12px 16px; text-align:center;
          box-shadow:0 10px 28px rgba(62,24,249,0.14);
          animation:ab-float 4s ease-in-out infinite;
        }
        .ab-exp-num { display:block; font-size:26px; font-weight:900; letter-spacing:-0.04em; line-height:1; }
        .ab-exp-lbl { display:block; font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:0.08em; }

        /* Orbiting dots */
        .ab-orbit { position:absolute; top:50%; left:50%; pointer-events:none; z-index:0; }
        .ab-orbit-1 { animation:ab-orbit1 10s linear infinite; }
        .ab-orbit-2 { animation:ab-orbit2 14s linear infinite; }
        .ab-orbit-dot {
          width:10px; height:10px; border-radius:50%;
          background:var(--li-purple); box-shadow:0 0 12px var(--li-purple);
        }
        .ab-orbit-dot-cyan { background:var(--li-cyan); box-shadow:0 0 12px var(--li-cyan); }

        /* Social row */
        .ab-social-row { display:flex; flex-wrap:wrap; gap:8px; margin-top:20px; }
        .ab-social-pill {
          padding:7px 14px; border-radius:6px; border:1px solid var(--li-border);
          background:white; font-size:12px; font-weight:800;
          color:var(--li-text-muted); text-decoration:none;
          font-family:'IBM Plex Mono',monospace;
          transition:all 0.18s ease;
        }
        .ab-social-pill:hover  { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.08); }
        .ab-pill-gh:hover      { background:#0F172A; color:white; border-color:#0F172A; }
        .ab-pill-li:hover      { background:#0077B5; color:white; border-color:#0077B5; }
        .ab-pill-ig:hover      { background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); color:white; border-color:transparent; }
        .ab-pill-resume:hover  { background:var(--li-purple); color:white; border-color:var(--li-purple); }

        /* ── Right side ── */
        .ab-right { display:flex; flex-direction:column; gap:24px; }

        .ab-bio-block { display:flex; gap:16px; }
        .ab-bio-bar   { width:3px; background:linear-gradient(to bottom,var(--li-purple),var(--li-cyan)); border-radius:999px; flex-shrink:0; }
        .ab-bio-text  { font-size:17px; font-weight:600; line-height:1.65; color:var(--li-text-main); margin:0; }

        .ab-summary {
          font-size:14px; color:var(--li-text-muted); line-height:1.70; margin:0;
          padding:14px 16px; border-radius:10px;
          background:rgba(62,24,249,0.04); border:1px solid rgba(62,24,249,0.10);
        }

        .ab-details { display:flex; flex-direction:column; gap:14px; }
        .ab-detail  { display:flex; align-items:flex-start; gap:12px; }
        .ab-detail-ico  { font-size:18px; flex-shrink:0; margin-top:1px; }
        .ab-detail-lbl  { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px; }
        .ab-detail-val  { display:block; font-size:14px; font-weight:700; color:var(--li-text-main); }
        .ab-detail-link { text-decoration:none; color:var(--li-purple); }
        .ab-detail-link:hover { text-decoration:underline; }

        /* Section label */
        .ab-section-label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--li-purple); letter-spacing:0.12em; text-transform:uppercase;
          margin:0; padding-bottom:10px; border-bottom:1px solid rgba(62,24,249,0.12);
        }

        /* Feature cards */
        .ab-feature-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .ab-feature-card {
          background:white; border:1px solid var(--li-border); border-radius:14px;
          padding:20px 18px; cursor:default; position:relative; overflow:hidden;
          box-shadow:0 4px 14px rgba(0,0,0,0.04);
          animation:ab-pop 0.5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .ab-feature-card::before {
          content:""; position:absolute; top:0; left:0; right:0; height:2.5px;
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan)); opacity:0;
          transition:opacity 0.25s;
        }
        .ab-feature-card:hover::before { opacity:1; }
        .ab-feature-icon  { font-size:26px; margin-bottom:10px; }
        .ab-feature-title { font-size:14px; font-weight:800; margin:0 0 6px; letter-spacing:-0.01em; }
        .ab-feature-desc  { font-size:12px; color:var(--li-text-muted); margin:0; line-height:1.55; }
        .ab-feature-shine {
          position:absolute; top:-40%; left:-40%; width:50%; height:180%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
          transform:skewX(-15deg);
          animation:ab-shimmer 3s ease-in-out infinite;
        }

        /* Responsive */
        @media(max-width:1024px){
          .ab-grid{grid-template-columns:1fr;gap:40px;}
          .ab-photo-wrap{max-width:340px;margin:0 auto;}
          .ab-orbit{display:none;}
        }
        @media(max-width:640px){
          .ab-feature-grid{grid-template-columns:1fr;}
        }
      `}</style>
    </section>
  );
};

export default AboutSection;