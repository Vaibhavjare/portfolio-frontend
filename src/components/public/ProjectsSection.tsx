import { useEffect, useMemo, useRef, useState } from "react";
import { useGetProjectsQuery } from "../../redux/services/projectApi";

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
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(34px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

/* ─── 3D tilt + aurora cursor card ─── */
const ProjectCard = ({ children, featured }: { children: React.ReactNode; featured?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0) rotateX(0) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      className={`project-card ps-card${featured ? " ps-card-featured" : ""}`}
      style={{ transition: "transform 0.20s ease", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

const CX_LABELS: Record<number, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
const CX_CLASS:  Record<number, string> = { 1: "ps-cx-1", 2: "ps-cx-2", 3: "ps-cx-3" };

const ProjectsSection = () => {
  const { data: allProjects = [], isLoading } = useGetProjectsQuery({});
  const [filter, setFilter] = useState<"all" | "featured">("featured");

  /* Aurora cursor on grid */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".ps-card").forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const featured  = useMemo(() => allProjects.filter(p => p.featured), [allProjects]);
  const displayed = filter === "featured" && featured.length > 0 ? featured : allProjects;

  const cx = (score?: number) => {
    if (!score) return null;
    return Math.ceil(score / 3.4) as 1 | 2 | 3;
  };

  if (isLoading) return (
    <section className="section" id="portfolio">
      <div style={{ display:"flex", gap:10, padding:"60px 0", justifyContent:"center" }}>
        <span className="ps-dot" /><span className="ps-dot" /><span className="ps-dot" />
      </div>
    </section>
  );

  return (
    <section className="section" id="portfolio">

      <Reveal className="section-header">
        <h2>Featured <span className="gradient-text">Projects</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          {allProjects.length > 0
            ? `${allProjects.length} project${allProjects.length !== 1 ? "s" : ""} · ${featured.length} featured`
            : "A selection of work that ships."}
        </p>
      </Reveal>

      {/* Filter pills */}
      {featured.length > 0 && allProjects.length > featured.length && (
        <Reveal delay={0.06} style={{ display:"flex", gap:8, marginBottom:32 }}>
          {(["featured", "all"] as const).map(f => (
            <button
              key={f}
              className={`ps-filter-pill${filter === f ? " ps-pill-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "featured" ? "⭐ Featured" : `All (${allProjects.length})`}
            </button>
          ))}
        </Reveal>
      )}

      {/* Grid */}
      {displayed.length > 0 ? (
        <div className="project-grid" style={{ maxWidth: 1100, width: "100%" }}>
          {displayed.slice(0, 9).map((p, i) => {
            const level = cx(p.complexity_score);
            const allTech = [
              ...(p.tech_stack?.programming_languages || []),
              ...(p.tech_stack?.frameworks || []),
              ...(p.tech_stack?.databases || []),
              ...(p.tech_stack?.tools || []),
            ];
            return (
              <Reveal key={p.project_id} delay={i * 0.07}>
                <ProjectCard featured={!!p.featured}>

                  {/* Aurora overlay — reacts to mouse */}
                  <div className="ps-aurora" />

                  {/* Top gradient bar */}
                  <div className="ps-top-bar" />

                  {/* Thumbnail */}
                  {p.thumbnail_url ? (
                    <div className="ps-thumb">
                      <img src={p.thumbnail_url} alt={p.title} />
                      <div className="ps-thumb-overlay" />
                    </div>
                  ) : (
                    <div className="ps-thumb ps-thumb-placeholder">
                      <span className="project-icon">
                        {(p.tags?.[0] || p.title)?.[0] === "A" ? "🤖"
                          : (p.tags?.[0] || p.title)?.[0] === "3" ? "🧠"
                          : "💻"}
                      </span>
                    </div>
                  )}

                  <div className="ps-body">
                    {/* Complexity + featured */}
                    <div className="ps-meta-row">
                      {level && (
                        <span className={`ps-cx ${CX_CLASS[level]}`}>{CX_LABELS[level]}</span>
                      )}
                      {p.featured && (
                        <span className="ps-feat-badge">⭐ Featured</span>
                      )}
                    </div>

                    <h3 style={{ margin: 0 }}>{p.title}</h3>

                    {p.description && (
                      <p className="ps-desc">{p.description}</p>
                    )}

                    {/* Tech stack chips */}
                    {allTech.length > 0 && (
                      <div className="ps-tech-row">
                        {allTech.slice(0, 5).map(t => (
                          <span key={t} className="ps-tech-chip">{t}</span>
                        ))}
                        {allTech.length > 5 && (
                          <span className="ps-tech-chip ps-chip-more">+{allTech.length - 5}</span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="ps-tags">
                        {p.tags.slice(0, 4).map(t => (
                          <span key={t} className="ps-tag">#{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="ps-links">
                      {p.github_link && (
                        <a href={p.github_link} target="_blank" rel="noreferrer" className="ps-link ps-link-gh">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          Code
                        </a>
                      )}
                      {p.live_demo_url && (
                        <a href={p.live_demo_url} target="_blank" rel="noreferrer" className="ps-link ps-link-live">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Live Demo
                        </a>
                      )}
                      {p.video_links && p.video_links[0] && (
                        <a href={p.video_links[0]} target="_blank" rel="noreferrer" className="ps-link ps-link-vid">
                          ▶ Video
                        </a>
                      )}
                    </div>
                  </div>
                </ProjectCard>
              </Reveal>
            );
          })}
        </div>
      ) : (
        /* Placeholder cards — original design */
        <div className="project-grid">
          {[
            { icon: "🤖", title: "AI Agent Platform",     desc: "Multi-agent reasoning system with memory." },
            { icon: "🧠", title: "3D MRI Reconstruction", desc: "Generated 3D brain model from MRI slices." },
            { icon: "🕶️", title: "AR Fashion Preview",    desc: "Real-time outfit try-on using AR." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="project-card">
              <div className="project-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes ps-dot   { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        @keyframes ps-bar   { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes ps-shine { from{opacity:.7} to{opacity:1} }

        /* Loader dots */
        .ps-dot {
          display:inline-block; width:8px; height:8px; border-radius:50%;
          background:var(--li-purple); animation:ps-dot 1.2s ease-in-out infinite;
        }
        .ps-dot:nth-child(2){animation-delay:.16s;}
        .ps-dot:nth-child(3){animation-delay:.32s;}

        /* Filter pills */
        .ps-filter-pill {
          padding:7px 16px; border-radius:999px; border:1px solid var(--li-border);
          background:white; color:var(--li-text-muted); font-size:12px; font-weight:800;
          cursor:pointer; font-family:'IBM Plex Mono',monospace;
          transition:all .18s ease;
        }
        .ps-filter-pill:hover { border-color:var(--li-purple); color:var(--li-purple); transform:translateY(-1px); }
        .ps-pill-active { background:var(--li-purple); color:white; border-color:var(--li-purple); box-shadow:0 4px 14px rgba(62,24,249,.28); }
        .ps-pill-active:hover { color:white; }

        /* Card */
        .ps-card {
          position:relative; overflow:hidden; cursor:default;
          border-radius:14px!important;
        }

        /* Aurora cursor glow */
        .ps-aurora {
          position:absolute; inset:0; border-radius:inherit; padding:1.5px;
          background:radial-gradient(520px circle at var(--mx,50%) var(--my,50%), rgba(62,24,249,0.15), transparent 40%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          pointer-events:none; z-index:1; transition:opacity .2s;
        }
        .ps-card::after {
          content:""; position:absolute; inset:0;
          background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(55,215,250,0.06), transparent 40%);
          pointer-events:none; z-index:0;
        }

        /* Top gradient accent bar */
        .ps-top-bar {
          position:absolute; top:0; left:0; right:0; height:3px; z-index:4;
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan));
          opacity:0; transition:opacity .25s;
        }
        .ps-card:hover .ps-top-bar { opacity:1; }
        .ps-card-featured .ps-top-bar { opacity:1; background:linear-gradient(90deg,#f59e0b,#fbbf24); }

        /* Thumbnail */
        .ps-thumb {
          height:180px; overflow:hidden; flex-shrink:0; position:relative;
          background:linear-gradient(135deg,rgba(62,24,249,.06),rgba(55,215,250,.06));
        }
        .ps-thumb img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .45s ease; }
        .ps-card:hover .ps-thumb img { transform:scale(1.05); }
        .ps-thumb-placeholder {
          display:flex; align-items:center; justify-content:center; height:100%;
        }
        .ps-thumb-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.04));
        }

        /* Body */
        .ps-body { padding:20px; display:flex; flex-direction:column; gap:10px; flex:1; position:relative; z-index:2; }
        .ps-meta-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

        /* Complexity badge */
        .ps-cx {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.04em;
        }
        .ps-cx-1 { background:rgba(148,163,184,.12); color:#64748b; }
        .ps-cx-2 { background:rgba(245,158,11,.12);  color:#b45309; }
        .ps-cx-3 { background:rgba(62,24,249,.10);   color:var(--li-purple); }

        /* Featured badge */
        .ps-feat-badge {
          font-size:11px; font-weight:800; padding:3px 9px; border-radius:4px;
          background:rgba(245,158,11,.12); color:#92400e;
          font-family:'IBM Plex Mono',monospace;
        }

        /* Description */
        .ps-desc {
          font-size:14px; color:var(--li-text-muted); margin:0; line-height:1.55;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }

        /* Tech chips */
        .ps-tech-row { display:flex; flex-wrap:wrap; gap:5px; }
        .ps-tech-chip {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700;
          padding:3px 8px; border-radius:5px;
          background:rgba(15,23,42,.04); border:1px solid var(--li-border); color:var(--li-text-muted);
        }
        .ps-chip-more { background:rgba(62,24,249,.06); color:var(--li-purple); border-color:rgba(62,24,249,.2); }

        /* Tags */
        .ps-tags { display:flex; flex-wrap:wrap; gap:5px; }
        .ps-tag  {
          font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px;
          background:rgba(62,24,249,.07); color:var(--li-purple);
          border:1px solid rgba(62,24,249,.15); font-family:'IBM Plex Mono',monospace;
        }

        /* Links */
        .ps-links { display:flex; gap:8px; margin-top:auto; padding-top:4px; flex-wrap:wrap; }
        .ps-link  {
          display:inline-flex; align-items:center; gap:5px; padding:6px 14px;
          border-radius:6px; font-size:12px; font-weight:800; text-decoration:none;
          border:1px solid; transition:all .18s ease; font-family:'IBM Plex Mono',monospace;
        }
        .ps-link-gh   { color:var(--li-text-muted); border-color:var(--li-border); background:transparent; }
        .ps-link-gh:hover { color:var(--li-text-main); border-color:var(--li-text-main); transform:translateY(-1px); }
        .ps-link-live { color:var(--li-purple); border-color:rgba(62,24,249,.25); background:rgba(62,24,249,.05); }
        .ps-link-live:hover { background:rgba(62,24,249,.12); transform:translateY(-1px); }
        .ps-link-vid  { color:#22c55e; border-color:rgba(34,197,94,.25); background:rgba(34,197,94,.06); }
        .ps-link-vid:hover { background:rgba(34,197,94,.14); transform:translateY(-1px); }
      `}</style>
    </section>
  );
};

export default ProjectsSection;