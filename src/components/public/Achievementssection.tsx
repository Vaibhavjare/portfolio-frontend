import { useEffect, useRef, useState } from "react";

/* ─── Scroll-reveal ─── */
const Reveal = ({
  children, delay = 0, className = "", style = {},
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...style, opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(32px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
};

/* ─── 3D Tilt card ─── */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
    el.style.setProperty("--ach-mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ach-my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateZ(0)";
    setHovered(false);
  };
  return (
    <div ref={ref} className={`${className}${hovered ? " ach-card--hovered" : ""}`}
      style={{ ...style, transition: "transform 0.20s ease, box-shadow 0.20s ease", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
    >{children}</div>
  );
};

/* ─── Animated counter ─── */
const Counter = ({ to }: { to: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || ran.current) return;
      ran.current = true; obs.disconnect();
      let cur = 0;
      const tick = () => {
        cur += 1;
        if (cur >= to) { setVal(to); return; }
        setVal(cur); requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}</span>;
};

/* ─── Achievement data ─── */
const ACHIEVEMENTS = [
  {
    icon: "🏆",
    rank: "Runner Up",
    title: "Avishkar National Level",
    org: "SVKM Institute of Technology",
    year: "2024",
    desc: "National-level research project competition recognizing innovative technical solutions.",
    color: "#f59e0b",
    tags: ["Research", "National"],
  },
  {
    icon: "🥇",
    rank: "1st Place",
    title: "InitHacks Track Winner",
    org: "InitHacks Hackathon",
    year: "2024",
    desc: "Track winner at InitHacks, recognized for building an impactful AI-powered solution.",
    color: "#3E18F9",
    tags: ["Hackathon", "AI"],
  },
  {
    icon: "🥈",
    rank: "2nd Place",
    title: "Ideathon Prize",
    org: "College-Level Ideathon",
    year: "2023",
    desc: "Second prize for presenting an innovative concept addressing a real-world problem.",
    color: "#22c55e",
    tags: ["Innovation", "Ideation"],
  },
  {
    icon: "🏅",
    rank: "Finalist",
    title: "AVINYA Finalist",
    org: "AVINYA Competition",
    year: "2023",
    desc: "Selected as a finalist for presenting an advanced technical project at AVINYA.",
    color: "#37D7FA",
    tags: ["Technical", "Finalist"],
  },
  {
    icon: "💼",
    rank: "Internship",
    title: "Database Intern",
    org: "AIwiz Tech Solutions",
    year: "2025",
    desc: "Worked on database architecture and optimization for AI-powered enterprise systems.",
    color: "#FF8DF2",
    tags: ["Industry", "AI"],
  },
  {
    icon: "🤝",
    rank: "Project",
    title: "AI Research – Medicinal Plants",
    org: "Academic Research",
    year: "2024",
    desc: "Developed CNN-based deep learning model for medicinal plant identification using image recognition.",
    color: "#10b981",
    tags: ["Deep Learning", "CV"],
  },
];

const AchievementsSection: React.FC = () => {
  /* Aurora cursor tracking per card */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".ach-card").forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--ach-mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--ach-my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const stats = [
    { icon: "🏆", val: ACHIEVEMENTS.filter(a => a.tags.includes("Hackathon") || a.rank.includes("Winner") || a.rank.includes("1st")).length, lbl: "Wins" },
    { icon: "🥈", val: ACHIEVEMENTS.filter(a => a.rank.includes("Runner") || a.rank.includes("2nd")).length,                                  lbl: "Runner Ups" },
    { icon: "🏅", val: ACHIEVEMENTS.filter(a => a.rank.includes("Finalist")).length,                                                            lbl: "Finalists" },
    { icon: "💼", val: ACHIEVEMENTS.filter(a => a.rank.includes("Internship") || a.rank.includes("Project")).length,                           lbl: "Roles" },
  ];

  return (
    <section className="section" id="achievements">

      <Reveal className="section-header">
        <p className="section-eyebrow">MILESTONES</p>
        <h2>Achievements &amp; <span className="gradient-text">Recognition</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          {ACHIEVEMENTS.length} milestones across hackathons, competitions &amp; research.
        </p>
      </Reveal>

      {/* Stats row */}
      <Reveal delay={0.06} style={{ width: "100%", maxWidth: 1100, marginBottom: 44 }}>
        <div className="ach-stats">
          {stats.map(({ icon, val, lbl }, i) => (
            <Reveal key={lbl} delay={i * 0.08}>
              <div className="ach-stat">
                <span className="ach-stat-icon">{icon}</span>
                <span className="ach-stat-val gradient-text"><Counter to={val} /></span>
                <span className="ach-stat-lbl">{lbl}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Cards grid */}
      <div className="ach-grid" style={{ maxWidth: 1100, width: "100%" }}>
        {ACHIEVEMENTS.map((ach, i) => (
          <Reveal key={ach.title} delay={i * 0.07}>
            <TiltCard className="ach-card" style={{ "--color": ach.color } as React.CSSProperties}>
              {/* Aurora cursor */}
              <div className="ach-aurora" />

              {/* Gradient top bar */}
              <div className="ach-top-bar" style={{ background: `linear-gradient(90deg, ${ach.color}, ${ach.color}88)` }} />

              <div className="ach-card-inner">
                {/* Icon + rank */}
                <div className="ach-card-head">
                  <div className="ach-icon-wrap" style={{ background: `${ach.color}18` }}>
                    <span className="ach-icon">{ach.icon}</span>
                  </div>
                  <span className="ach-rank" style={{ color: ach.color, background: `${ach.color}12`, borderColor: `${ach.color}30` }}>
                    {ach.rank}
                  </span>
                </div>

                <div className="ach-text">
                  <h3 className="ach-title">{ach.title}</h3>
                  <p className="ach-org">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {ach.org}
                  </p>
                </div>

                <p className="ach-desc">{ach.desc}</p>

                <div className="ach-footer">
                  <div className="ach-tags">
                    {ach.tags.map(t => (
                      <span key={t} className="ach-tag" style={{ color: ach.color, borderColor: `${ach.color}30`, background: `${ach.color}0A` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="ach-year">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {ach.year}
                  </span>
                </div>
              </div>

              {/* Shine sweep */}
              <div className="ach-shine" />
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <style>{`
        @keyframes ach-shimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(220%) skewX(-15deg)} }
        @keyframes ach-bar     { 0%,100%{opacity:.8} 50%{opacity:1} }
        @keyframes ach-popin   { 0%{transform:scale(.80) translateY(14px);opacity:0} 70%{transform:scale(1.02)} 100%{transform:none;opacity:1} }
        @keyframes ach-count   { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes ach-glow    { 0%,100%{box-shadow:0 0 0 0 rgba(var(--r,62),var(--g,24),var(--b,249),.25)} 50%{box-shadow:0 0 0 8px rgba(var(--r,62),var(--g,24),var(--b,249),0)} }

        /* Stats row */
        .ach-stats {
          display:grid; grid-template-columns:repeat(4,1fr); gap:14px;
        }
        .ach-stat {
          background:white; border:1px solid var(--li-border); border-radius:14px;
          padding:18px 20px; display:flex; flex-direction:column; gap:4px;
          box-shadow:0 4px 12px rgba(2,6,23,.04);
          animation:ach-popin .45s cubic-bezier(.34,1.56,.64,1) both;
          transition:transform .20s ease, box-shadow .20s ease;
        }
        .ach-stat:hover { transform:translateY(-3px); box-shadow:0 12px 28px rgba(62,24,249,.10); }
        .ach-stat-icon { font-size:22px; margin-bottom:2px; }
        .ach-stat-val  { font-size:28px; font-weight:900; letter-spacing:-.04em; line-height:1; animation:ach-count .6s cubic-bezier(.34,1.56,.64,1) both; }
        .ach-stat-lbl  { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.07em; }

        /* Grid */
        .ach-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(310px,1fr));
          gap:20px; align-items:start;
        }

        /* Card */
        .ach-card {
          background:white; border-radius:16px; border:1px solid var(--li-border);
          box-shadow:0 6px 22px rgba(2,6,23,.05);
          display:flex; flex-direction:column; overflow:hidden;
          cursor:default; position:relative;
          transition:box-shadow .22s ease, transform .20s ease;
        }
        .ach-card:hover,
        .ach-card--hovered {
          box-shadow:0 20px 50px rgba(62,24,249,.13);
        }

        /* Aurora */
        .ach-aurora {
          position:absolute; inset:0; pointer-events:none; z-index:0;
          background:radial-gradient(500px circle at var(--ach-mx,50%) var(--ach-my,50%), rgba(62,24,249,.07), transparent 45%);
          opacity:0; transition:opacity .3s;
        }
        .ach-card:hover .ach-aurora { opacity:1; }

        /* Top bar */
        .ach-top-bar {
          height:3px; flex-shrink:0; position:relative; overflow:hidden;
          animation:ach-bar 3s ease-in-out infinite;
        }
        .ach-top-bar::after {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
          animation:ach-shimmer 2s ease-in-out infinite;
        }

        /* Card inner */
        .ach-card-inner {
          padding:18px 20px; display:flex; flex-direction:column; gap:12px;
          position:relative; z-index:1;
        }

        .ach-card-head { display:flex; align-items:center; gap:10px; }
        .ach-icon-wrap {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          transition:transform .2s ease;
        }
        .ach-card:hover .ach-icon-wrap { transform:scale(1.08) rotate(-3deg); }
        .ach-icon { font-size:22px; }

        .ach-rank {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          padding:4px 10px; border-radius:6px; border:1px solid;
          text-transform:uppercase; letter-spacing:.04em;
        }

        .ach-text { display:flex; flex-direction:column; gap:5px; }
        .ach-title {
          font-size:16px; font-weight:800; margin:0; line-height:1.25; letter-spacing:-.02em;
          transition:color .2s;
        }
        .ach-card:hover .ach-title { color:var(--color,var(--li-purple)); }
        .ach-org {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          color:var(--li-text-muted); margin:0;
          display:flex; align-items:center; gap:5px;
        }

        .ach-desc {
          font-size:13px; color:var(--li-text-muted); line-height:1.60; margin:0;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }

        .ach-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:4px; }
        .ach-tags   { display:flex; flex-wrap:wrap; gap:5px; }
        .ach-tag {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          padding:2px 8px; border-radius:4px; border:1px solid;
          transition:transform .15s ease;
        }
        .ach-tag:hover { transform:translateY(-1px); }
        .ach-year {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          color:var(--li-text-muted); white-space:nowrap;
          display:inline-flex; align-items:center; gap:4px; flex-shrink:0;
        }

        /* Shine */
        .ach-shine {
          position:absolute; top:-40%; left:-40%; width:50%; height:180%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.20),transparent);
          transform:skewX(-15deg);
          animation:ach-shimmer 3.5s ease-in-out infinite;
          pointer-events:none; z-index:2;
        }

        @media(max-width:900px)  { .ach-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px)  { .ach-grid { grid-template-columns:1fr; } .ach-stats { grid-template-columns:repeat(2,1fr); gap:10px; } }
      `}</style>
    </section>
  );
};

export default AchievementsSection;