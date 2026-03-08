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
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px) scale(1.02)`;
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

/* ─── Animated proficiency bar (Bottom Edge) ─── */
const ProfBar = ({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setW(pct), delay * 1000 + 100); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct, delay]);
  
  return (
    <div ref={ref} className="skill-badge-bar-wrap">
      <div
        className="skill-badge-bar"
        style={{ width: `${w}%`, background: color }}
      />
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

const TechStackSection = () => {
  const { data: allSkills = [], isLoading } = useGetSkillsQuery({});

  const active = useMemo(() => allSkills.filter(s => s.is_active !== false), [allSkills]);

  /* Group by category */
  const byCategory = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    active.forEach(s => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    /* Sort within each category */
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99) || (b.rating ?? 0) - (a.rating ?? 0));
    });
    return map;
  }, [active]);

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
        <p className="section-eyebrow">EXPERTISE</p>
        <h2>Tech <span className="gradient-text">Stack</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          {active.length} skills across {Object.keys(byCategory).length} categories
        </p>
      </Reveal>

      {/* Categories & Skills Grid */}
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", gap: 40 }}>
        {Object.entries(byCategory).map(([cat, skills], catIdx) => (
          <Reveal key={cat} delay={catIdx * 0.08}>
            <div className="skill-category-block">
              <h3 className="skill-cat-title">{cat}</h3>
              
              <div className="skills-grid">
                {skills.map((s, i) => {
                  const accent = s.color || PROF_COL[s.proficiency_level || ""] || "#3E18F9";
                  const pct = s.rating != null ? (s.rating / 10) * 100 : (PROF_PCT[s.proficiency_level || ""] || 0);

                  return (
                    <TiltCard key={s.skill_id} className="skill-badge-3d">
                      <div 
                        className="skill-badge-inner" 
                        style={{ "--accent": accent, borderColor: `${accent}33` } as React.CSSProperties}
                      >
                        {/* Icon or Letter */}
                        {s.icon_url ? (
                          <img src={s.icon_url} alt={s.name} className="skill-icon-img" />
                        ) : (
                          <span className="skill-icon-letter" style={{ color: accent }}>
                            {s.name.charAt(0)}
                          </span>
                        )}
                        
                        {/* Skill Name */}
                        <span className="skill-badge-name">{s.name}</span>
                        
                        {/* Bottom Progress Bar */}
                        {pct > 0 && <ProfBar pct={pct} color={accent} delay={catIdx * 0.08 + i * 0.04} />}
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
            {["Python", "Machine Learning", "React", "MongoDB", "Agentic AI", "Git"].map(s => (
              <div key={s} className="skill-badge-fallback">{s}</div>
            ))}
          </div>
        </Reveal>
      )}

      <style>{`
        @keyframes ts-shimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(220%) skewX(-15deg)} }
        @keyframes ts-dot     { 0%,80%,100%{transform:scale(0);opacity:0.3} 40%{transform:scale(1);opacity:1} }

        /* Loader */
        .ts-loader { display:flex; gap:8px; padding:80px 0; justify-content:center; align-items:center; }
        .ts-loader-dot {
          width:8px; height:8px; border-radius:50%; background:var(--li-purple);
          animation:ts-dot 1.2s ease-in-out infinite;
        }
        .ts-loader-dot:nth-child(2){animation-delay:0.16s;}
        .ts-loader-dot:nth-child(3){animation-delay:0.32s;}

        /* Category Layout */
        .skill-category-block { width:100%; }
        .skill-cat-title {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          color:var(--li-purple); text-transform:uppercase; letter-spacing:0.10em;
          margin:0 0 16px; padding-bottom:8px; border-bottom:1px solid rgba(62,24,249,.15);
        }
        
        .skills-grid { display:flex; flex-wrap:wrap; gap:12px; }

        /* Skill Pill Layout */
        .skill-badge-3d { cursor:default; }
        
        .skill-badge-inner {
          display:flex; align-items:center; gap:10px; background:white;
          border-radius:10px; border:1px solid; padding:10px 16px;
          min-width:130px; box-shadow:0 4px 12px rgba(0,0,0,.04);
          position:relative; overflow:hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .skill-badge-inner:hover {
          border-color: color-mix(in srgb, var(--accent) 70%, transparent) !important;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 15%, transparent);
        }
        
        /* Shimmer sweep effect */
        .skill-badge-inner::after {
          content:""; position:absolute; top:-40%; left:-40%; width:50%; height:180%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);
          transform:skewX(-15deg); animation:ts-shimmer 3s ease-in-out infinite;
        }

        .skill-icon-img { width:20px; height:20px; object-fit:contain; flex-shrink:0; }
        .skill-icon-letter {
          width:20px; height:20px; flex-shrink:0; font-size:14px; font-weight:900;
          display:flex; align-items:center; justify-content:center;
        }

        .skill-badge-name {
          font-size:13px; font-weight:700; font-family:'IBM Plex Mono',monospace;
          padding-bottom:1px;
        }

        /* Bottom Proficiency Bar */
        .skill-badge-bar-wrap {
          position:absolute; bottom:0; left:0; right:0; height:3px;
          background:rgba(0,0,0,.05); border-radius:0 0 10px 10px; overflow:hidden;
        }
        .skill-badge-bar {
          height:100%; border-radius:0 0 10px 10px;
          transition: width 1s cubic-bezier(.22,1,.36,1);
        }

        /* Fallback Pill */
        .skill-badge-fallback {
          font-family:'IBM Plex Mono',monospace; background:white; color:var(--li-text-main);
          padding:12px 20px; border-radius:8px; font-weight:600; font-size:13px;
          border:1px solid var(--li-border); box-shadow:0 2px 8px rgba(0,0,0,.02);
        }
      `}</style>
    </section>
  );
};

export default TechStackSection;