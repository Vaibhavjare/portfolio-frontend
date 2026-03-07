import { useEffect, useMemo, useRef, useState } from "react";
import { useGetSkillsQuery } from "../../redux/services/skillApi";
import type { Skill } from "../../redux/services/skillApi";

/* ─── Scroll-reveal ─── */
const Reveal = ({
  children, delay = 0, className = "", style = {},
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.10 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(30px)",
      transition: `opacity 0.60s ease ${delay}s, transform 0.60s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

/* ─── 3D Tilt ─── */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateZ(12px) scale(1.03)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(600px) rotateY(0) rotateX(0) translateZ(0) scale(1)";
  };
  return (
    <div ref={ref} className={className} style={{ ...style, transition: "transform 0.18s ease", willChange: "transform" }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
};

/* ─── Animated proficiency bar ─── */
const ProfBar = ({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(pct), delay * 1000 + 200); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  return (
    <div ref={ref} style={{ height: 3, background: "rgba(0,0,0,0.06)", borderRadius: 999, overflow: "hidden", marginTop: 4 }}>
      <div style={{
        height: "100%", width: `${w}%`, background: color,
        borderRadius: 999, transition: "width 1s cubic-bezier(.22,1,.36,1)",
        position: "relative", overflow: "hidden",
      }}>
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
          animation: "ts-shimmer 1.8s ease-in-out infinite",
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
const CAT_ICONS: Record<string, string> = {
  "AI / ML": "🤖", "Machine Learning": "🧠", "Deep Learning": "🧬",
  "Frontend": "🎨", "Backend": "⚙️", "Database": "🗄️",
  "Cloud": "☁️", "DevOps": "🔧", "Mobile": "📱",
  "Languages": "💻", "Tools": "🛠️", "Other": "⚡",
};

const TechStackSection = () => {
  const { data: allSkills = [], isLoading } = useGetSkillsQuery({});
  const [activeCategory, setActiveCategory] = useState("All");

  const active = useMemo(() => allSkills.filter(s => s.is_active !== false), [allSkills]);

  /* Group by category */
  const byCategory = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    active.forEach(s => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    /* sort within each category by display_order or rating */
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99) || (b.rating ?? 0) - (a.rating ?? 0));
    });
    return map;
  }, [active]);

  const categories = ["All", ...Object.keys(byCategory)];

  const displayed = useMemo(() =>
    activeCategory === "All" ? byCategory
      : { [activeCategory]: byCategory[activeCategory] ?? [] },
    [activeCategory, byCategory]);

  if (isLoading) return (
    <section className="section bg-light-grey" id="skills">
      <div className="ts-loader">
        <span className="ts-loader-dot" /><span className="ts-loader-dot" /><span className="ts-loader-dot" />
      </div>
    </section>
  );

  return (
    <section className="section bg-light-grey" id="skills">

      <Reveal className="section-header">
        <h2>Tech <span className="gradient-text">Stack</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          {active.length} skills across {Object.keys(byCategory).length} domains
        </p>
      </Reveal>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <Reveal delay={0.08} style={{ marginBottom: 36, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`ts-pill${activeCategory === cat ? " ts-pill-active" : ""}`}
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => setActiveCategory(cat)}
            >
              {CAT_ICONS[cat] || "◈"} {cat}
              {cat !== "All" && <span className="ts-pill-count">{byCategory[cat]?.length}</span>}
            </button>
          ))}
        </Reveal>
      )}

      {/* Skills by category */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 40 }}>
        {Object.entries(displayed).map(([cat, skills], catIdx) => (
          <Reveal key={cat} delay={catIdx * 0.06}>
            <div className="ts-cat-block">
              <div className="ts-cat-header">
                <span className="ts-cat-icon">{CAT_ICONS[cat] || "◈"}</span>
                <h3 className="ts-cat-title">{cat}</h3>
                <span className="ts-cat-count">{skills.length}</span>
              </div>

              <div className="skills-grid">
                {skills.map((s, i) => {
                  const accent = s.color || PROF_COL[s.proficiency_level || ""] || "#3E18F9";
                  const pct    = PROF_PCT[s.proficiency_level || ""] ?? (s.rating != null ? s.rating * 10 : null);
                  return (
                    <TiltCard key={s.skill_id} className="ts-badge">
                      <div className="ts-badge-inner" style={{ "--accent": accent } as React.CSSProperties}>

                        {/* Left — icon or letter */}
                        <div className="ts-badge-icon-wrap" style={{ background: accent + "1A" }}>
                          {s.icon_url
                            ? <img src={s.icon_url} alt={s.name} className="ts-icon-img" />
                            : <span className="ts-icon-letter" style={{ color: accent }}>{s.name.charAt(0)}</span>
                          }
                        </div>

                        {/* Right — name + meta */}
                        <div className="ts-badge-text">
                          <span className="ts-badge-name">{s.name}</span>
                          {s.years_of_experience != null && (
                            <span className="ts-badge-yrs">{s.years_of_experience}y exp</span>
                          )}
                          {s.proficiency_level && (
                            <span className="ts-badge-level" style={{ color: accent }}>
                              {s.proficiency_level}
                            </span>
                          )}
                        </div>

                        {/* Bottom proficiency bar */}
                        {pct != null && <ProfBar pct={pct} color={accent} delay={catIdx * 0.06 + i * 0.03} />}

                        {/* Shimmer sweep */}
                        <div className="ts-shine" />
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Fallback if no skills */}
      {active.length === 0 && !isLoading && (
        <Reveal>
          <div className="skills-grid" style={{ maxWidth: 900 }}>
            {["Python & FastAPI","Machine Learning","React & TypeScript","MongoDB & MySQL","Agentic AI & LLMs","Cloud Deployment"].map(s => (
              <div key={s} className="skill-badge">{s}</div>
            ))}
          </div>
        </Reveal>
      )}

      <style>{`
        @keyframes ts-shimmer { 0%{transform:translateX(-100%)skewX(-15deg)} 100%{transform:translateX(220%)skewX(-15deg)} }
        @keyframes ts-dot     { 0%,80%,100%{transform:scale(0);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        @keyframes ts-pill-pop{ from{opacity:0;transform:scale(0.8) translateX(-6px)} to{opacity:1;transform:none} }

        /* Loader */
        .ts-loader { display:flex; gap:8px; padding:80px 0; justify-content:center; align-items:center; }
        .ts-loader-dot {
          width:8px; height:8px; border-radius:50%; background:var(--li-purple);
          animation:ts-dot 1.2s ease-in-out infinite;
        }
        .ts-loader-dot:nth-child(2){animation-delay:0.16s;}
        .ts-loader-dot:nth-child(3){animation-delay:0.32s;}

        /* Category filter pills */
        .ts-pill {
          padding:7px 14px; border-radius:999px; border:1px solid var(--li-border);
          background:white; color:var(--li-text-muted); font-size:12px; font-weight:700;
          cursor:pointer; display:inline-flex; align-items:center; gap:5px;
          font-family:'IBM Plex Mono',monospace;
          opacity:0; animation:ts-pill-pop 0.35s cubic-bezier(.34,1.56,.64,1) both;
          transition:all 0.18s ease;
        }
        .ts-pill:hover         { border-color:var(--li-purple); color:var(--li-purple); transform:translateY(-1px); }
        .ts-pill-active        { background:var(--li-purple); color:white; border-color:var(--li-purple); box-shadow:0 4px 14px rgba(62,24,249,0.28); }
        .ts-pill-active:hover  { color:white; }
        .ts-pill-count         { background:rgba(255,255,255,0.25); border-radius:999px; padding:1px 6px; font-size:10px; }
        .ts-pill-active .ts-pill-count { background:rgba(255,255,255,0.22); }

        /* Category block */
        .ts-cat-block { width:100%; }
        .ts-cat-header {
          display:flex; align-items:center; gap:10px; margin-bottom:18px;
          padding-bottom:12px; border-bottom:1px solid rgba(62,24,249,0.10);
        }
        .ts-cat-icon  { font-size:20px; }
        .ts-cat-title {
          font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:800;
          color:var(--li-purple); text-transform:uppercase; letter-spacing:0.08em; margin:0;
        }
        .ts-cat-count {
          margin-left:auto; background:rgba(62,24,249,0.08); color:var(--li-purple);
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          padding:3px 9px; border-radius:999px;
        }

        /* Skill badge */
        .ts-badge { cursor:default; }
        .ts-badge-inner {
          position:relative; overflow:hidden;
          background:white; border:1px solid color-mix(in srgb,var(--accent) 20%,transparent);
          border-radius:12px; padding:12px 14px;
          box-shadow:0 3px 10px rgba(0,0,0,0.04);
          display:flex; flex-direction:column; gap:4px;
          min-width:130px;
        }
        .ts-badge-inner:hover { border-color:color-mix(in srgb,var(--accent) 50%,transparent); }

        .ts-badge-icon-wrap {
          width:36px; height:36px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; margin-bottom:6px;
        }
        .ts-icon-img    { width:24px; height:24px; object-fit:contain; }
        .ts-icon-letter { font-size:18px; font-weight:900; line-height:1; }

        .ts-badge-text { display:flex; flex-direction:column; gap:2px; }
        .ts-badge-name {
          font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:700;
          color:var(--li-text-main); line-height:1.2;
        }
        .ts-badge-yrs   { font-size:10px; font-weight:700; color:var(--li-text-muted); font-family:'IBM Plex Mono',monospace; }
        .ts-badge-level { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; font-family:'IBM Plex Mono',monospace; }

        /* Shine sweep */
        .ts-shine {
          position:absolute; top:-40%; left:-40%; width:50%; height:180%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);
          transform:skewX(-15deg);
          animation:ts-shimmer 2.8s ease-in-out infinite;
        }

        /* Inherit parent skills-grid */
        .skills-grid { display:flex; flex-wrap:wrap; gap:12px; }
      `}</style>
    </section>
  );
};

export default TechStackSection;