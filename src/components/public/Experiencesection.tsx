import { useEffect, useRef, useState } from "react";
import { useGetExperiencesQuery } from "../../redux/services/experienceApi";
import { useGetEducationsQuery }  from "../../redux/services/educationApi";
import type { Experience }        from "../../redux/services/experienceApi";
import type { Education }         from "../../redux/services/educationApi";

/* ─── Scroll-reveal ─── */
const Reveal = ({
  children, delay = 0, className = "", style = {},
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...style, opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(28px)",
      transition: `opacity 0.60s ease ${delay}s, transform 0.60s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
};

/* ─── Date helpers ─── */
function fmtDate(iso?: string): string {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" }); }
  catch { return ""; }
}
function dateRange(start?: string, end?: string): string {
  const s = fmtDate(start);
  const e = end ? fmtDate(end) : "Present";
  return s ? `${s} – ${e}` : "";
}

/*
  ─── WHY THE TS ERROR HAPPENED ────────────────────────────────
  Error TS2352: "Conversion of type 'Experience' to type
  'Record<string, unknown>' may be a mistake because neither type
  sufficiently overlaps with the other."

  TypeScript refuses a DIRECT cast  `exp as Record<string,unknown>`
  when the two types don't share enough structure.

  FIX: cast via `unknown` first →  `exp as unknown as Record<string,unknown>`
  (double-cast / escape hatch). This is the standard TS pattern.

  BUT — the BETTER fix is to avoid the cast entirely by using the
  actual typed fields directly from the Experience / Education interfaces.
  That's what we do below.
  ────────────────────────────────────────────────────────────────
*/

/* ─── Timeline Card (properly typed) ─── */
const TimelineCard = ({
  accent, icon, title, subtitle, date, location, description,
  tags, badge, isLast, index,
}: {
  accent: string; icon: React.ReactNode;
  title: string; subtitle: string; date: string;
  location?: string; description?: string;
  tags?: string[]; badge?: string;
  isLast: boolean; index: number;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div className={`htl-item${hovered ? " htl-item--hovered" : ""}`}
      style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}>
      <div
        className={`htl-card${hovered ? " htl-card--hover" : ""}`}
        style={{ "--accent": accent } as React.CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Colored top bar */}
        <div className="htl-card-topbar" />

        <div className="htl-card-body">
          {/* Header */}
          <div className="htl-card-header">
            <div className="htl-icon-wrap">{icon}</div>
            <div className="htl-card-meta">
              {date     && <span className="htl-date">{date}</span>}
              {location && <span className="htl-loc">📍 {location}</span>}
            </div>
            {badge && <span className="htl-badge">{badge}</span>}
          </div>

          <h4 className="htl-title">{title}</h4>
          <p  className="htl-subtitle">{subtitle}</p>
          {description && <p className="htl-desc">{description}</p>}

          {tags && tags.length > 0 && (
            <div className="htl-tags">
              {tags.map(t => <span key={t} className="htl-tag">{t}</span>)}
            </div>
          )}
        </div>

        <div className="htl-shimmer" />
      </div>

      {/* Connector node + line */}
      <div className="htl-connector">
        <div className="htl-node" style={{ borderColor: accent }}>
          <div className="htl-node-dot" style={{ background: accent }} />
        </div>
        {!isLast && <div className="htl-line" style={{ background: `linear-gradient(90deg,${accent}66,${accent}11)` }} />}
      </div>

      {date && (
        <span className="htl-year-label" style={{ color: accent }}>
          {date.split("–")[0].trim()}
        </span>
      )}
    </div>
  );
};

/* ─── Main Section ─── */
const ExperienceSection: React.FC = () => {
  const { data: allExps = [], isLoading: loadingExp } = useGetExperiencesQuery({});
  const { data: allEdus = [], isLoading: loadingEdu } = useGetEducationsQuery({});
  const [tab, setTab] = useState<"work" | "edu">("work");

  const isLoading = loadingExp || loadingEdu;

  if (isLoading) return (
    <section className="section bg-light-grey" id="experience">
      <div style={{ display:"flex", gap:10, padding:"80px 0", justifyContent:"center" }}>
        <span className="exp-dot"/><span className="exp-dot"/><span className="exp-dot"/>
      </div>
    </section>
  );

  if (allExps.length === 0 && allEdus.length === 0) return null;

  const showWork = tab === "work";

  return (
    <section className="section bg-light-grey" id="experience">

      {/* Header */}
      <Reveal className="section-header">
        <p className="section-eyebrow">JOURNEY</p>
        <h2>Experience &amp; <span className="gradient-text">Education</span></h2>
        <p className="subtitle" style={{ margin:"10px auto 0" }}>
          {allExps.length > 0 && `${allExps.length} role${allExps.length !== 1 ? "s" : ""}`}
          {allExps.length > 0 && allEdus.length > 0 && " · "}
          {allEdus.length > 0 && `${allEdus.length} qualification${allEdus.length !== 1 ? "s" : ""}`}
        </p>
      </Reveal>

      {/* Tab switcher */}
      <Reveal delay={0.05} style={{ marginBottom:40, display:"flex", justifyContent:"center", width:"100%" }}>
        <div className="htl-tabs">
          <button
            className={`htl-tab${tab === "work" ? " htl-tab--active" : ""}`}
            onClick={() => setTab("work")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            Work Experience
            <span className="htl-tab-count">{allExps.length}</span>
          </button>
          <button
            className={`htl-tab${tab === "edu" ? " htl-tab--active" : ""}`}
            onClick={() => setTab("edu")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Education
            <span className="htl-tab-count">{allEdus.length}</span>
          </button>
        </div>
      </Reveal>

      {/* ── Horizontal timeline ── */}
      <div className="htl-outer">
        <div className="htl-viewport">
          <div className="htl-track">
            {showWork
              ? allExps.map((exp: Experience, i: number) => (
                  <TimelineCard
                    key={exp.experience_id}
                    index={i}
                    accent="#3E18F9"
                    isLast={i === allExps.length - 1}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3E18F9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      </svg>
                    }
                    title={exp.position}
                    subtitle={exp.company}
                    date={dateRange(exp.start_date, exp.end_date)}
                    location={exp.location}
                    description={exp.description}
                    badge={!exp.end_date ? "● Current" : exp.featured ? "⭐ Featured" : undefined}
                    tags={[]}
                  />
                ))
              : allEdus.map((edu: Education, i: number) => (
                  <TimelineCard
                    key={edu.education_id}
                    index={i}
                    accent="#0ea5e9"
                    isLast={i === allEdus.length - 1}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    }
                    title={edu.degree}
                    subtitle={edu.institution}
                    date={dateRange(edu.start_date, edu.end_date)}
                    description={edu.description}
                    badge={edu.grade ? `📊 ${edu.grade}` : undefined}
                    tags={edu.field_of_study ? [edu.field_of_study] : []}
                  />
                ))
            }
          </div>
        </div>
      </div>

      <style>{`
        @keyframes exp-dot     { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        @keyframes htl-shimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(220%) skewX(-15deg)} }
        @keyframes htl-item-in { 0%{opacity:0;transform:translateY(24px)} 100%{opacity:1;transform:none} }

        .exp-dot { display:inline-block; width:9px; height:9px; border-radius:50%; background:#3E18F9; animation:exp-dot 1.2s ease-in-out infinite; }
        .exp-dot:nth-child(2){animation-delay:.16s;} .exp-dot:nth-child(3){animation-delay:.32s;}

        /* ── Tab switcher ── */
        .htl-tabs {
          display:inline-flex; gap:5px; background:white;
          padding:5px; border-radius:12px; border:1px solid #EFEFEF;
          box-shadow:0 2px 8px rgba(0,0,0,.04);
        }
        .htl-tab {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 20px; border-radius:8px; border:none;
          background:transparent; font-size:13px; font-weight:700;
          color:#52525B; cursor:pointer;
          font-family:'Inter',sans-serif; white-space:nowrap;
          transition:all .22s cubic-bezier(.34,1.56,.64,1);
        }
        .htl-tab:hover { color:#000; background:rgba(0,0,0,.03); }
        .htl-tab--active {
          background:#000; color:white;
          box-shadow:0 4px 14px rgba(0,0,0,.14);
          transform:scale(1.02);
        }
        .htl-tab-count {
          font-family:'IBM Plex Mono',monospace;
          padding:1px 7px; border-radius:999px; font-size:11px; font-weight:800;
        }
        .htl-tab--active .htl-tab-count { background:rgba(255,255,255,.22); }
        .htl-tab:not(.htl-tab--active) .htl-tab-count { background:rgba(62,24,249,.08); color:#3E18F9; }

        /* ── Outer wrapper — centers when few items ── */
        .htl-outer {
          width:100%; display:flex; justify-content:center;
          overflow:hidden;
        }

        /* ── Scrollable viewport ── */
        .htl-viewport {
          width:100%; max-width:1160px;
          overflow-x:auto; overflow-y:visible;
          padding-bottom:12px;
          scrollbar-width:thin; scrollbar-color:rgba(62,24,249,.25) transparent;
          /* Fade edges so it looks polished */
          -webkit-mask-image:linear-gradient(to right,transparent 0%,black 4%,black 96%,transparent 100%);
          mask-image:linear-gradient(to right,transparent 0%,black 4%,black 96%,transparent 100%);
        }
        .htl-viewport::-webkit-scrollbar { height:4px; }
        .htl-viewport::-webkit-scrollbar-track { background:transparent; }
        .htl-viewport::-webkit-scrollbar-thumb { background:rgba(62,24,249,.25); border-radius:999px; }

        /* ── Track — flex row of cards ── */
        .htl-track {
          display:flex; align-items:flex-start;
          justify-content:center;       /* center when fewer items */
          min-width:100%;
          width:max-content;
          padding:32px 48px 56px;
          gap:0;
        }

        /* ── Each item wrapper ── */
        .htl-item {
          display:flex; flex-direction:column; align-items:center;
          width:300px; flex-shrink:0;
          animation:htl-item-in 0.55s cubic-bezier(.22,1,.36,1) var(--delay,0s) both;
        }

        /* ── Card ── */
        .htl-card {
          width:100%; background:white;
          border:1.5px solid #EFEFEF; border-radius:16px;
          box-shadow:0 4px 18px rgba(0,0,0,.06);
          position:relative; overflow:hidden;
          transition:box-shadow .25s ease, transform .22s ease, border-color .22s;
          cursor:default; margin-bottom:20px;
        }
        .htl-card--hover {
          box-shadow:0 20px 44px rgba(62,24,249,.15);
          transform:translateY(-6px);
          border-color:rgba(62,24,249,.20);
        }

        /* Colored top bar */
        .htl-card-topbar {
          height:4px;
          background:linear-gradient(90deg,var(--accent,#3E18F9),#37D7FA);
          position:relative; overflow:hidden;
        }
        .htl-card-topbar::after {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);
          animation:htl-shimmer 2.4s ease-in-out infinite;
        }

        .htl-card-body { padding:16px 18px; display:flex; flex-direction:column; gap:9px; }

        .htl-card-header { display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap; }
        .htl-icon-wrap {
          width:32px; height:32px; border-radius:8px; flex-shrink:0;
          background:rgba(62,24,249,.08);
          display:flex; align-items:center; justify-content:center;
          transition:transform .2s ease;
        }
        .htl-card--hover .htl-icon-wrap { transform:scale(1.12) rotate(-4deg); }
        .htl-card-meta { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
        .htl-date  { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:#52525B; white-space:nowrap; }
        .htl-loc   { font-size:10px; color:#52525B; font-weight:600; }
        .htl-badge {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          padding:3px 8px; border-radius:4px; white-space:nowrap; flex-shrink:0;
          background:rgba(34,197,94,.10); color:#166534;
        }

        .htl-title    { font-size:15px; font-weight:800; margin:0; letter-spacing:-.02em; line-height:1.25; transition:color .2s; }
        .htl-card--hover .htl-title { color:var(--accent,#3E18F9); }
        .htl-subtitle { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700; color:#3E18F9; margin:0; }
        .htl-desc     { font-size:12px; color:#52525B; margin:0; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

        .htl-tags { display:flex; flex-wrap:wrap; gap:5px; }
        .htl-tag  { font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; background:rgba(62,24,249,.07); color:#3E18F9; border:1px solid rgba(62,24,249,.15); font-family:'IBM Plex Mono',monospace; }

        /* Shimmer sweep across card */
        .htl-shimmer { position:absolute; top:-40%; left:-40%; width:50%; height:180%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent); transform:skewX(-15deg); animation:htl-shimmer 3.5s ease-in-out infinite; pointer-events:none; }

        /* ── Connector (dot + horizontal line) ── */
        .htl-connector { display:flex; align-items:center; width:100%; }
        .htl-node {
          width:22px; height:22px; border-radius:50%; flex-shrink:0;
          border:2.5px solid; background:white;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 0 5px rgba(62,24,249,.07); z-index:2;
          transition:transform .22s ease, box-shadow .22s ease;
        }
        .htl-item--hovered .htl-node { transform:scale(1.35); box-shadow:0 0 0 9px rgba(62,24,249,.09); }
        .htl-node-dot { width:9px; height:9px; border-radius:50%; }
        .htl-line { flex:1; height:2px; min-width:0; }

        .htl-year-label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          letter-spacing:.06em; margin-top:7px; text-transform:uppercase;
        }

        @media(max-width:900px)  { .htl-item { width:270px; } }
        @media(max-width:768px)  { .htl-item { width:250px; } .htl-tabs { flex-wrap:wrap; } .htl-track { padding:24px 20px 44px; } }
        @media(max-width:480px)  { .htl-item { width:220px; } }
      `}</style>
    </section>
  );
};

export default ExperienceSection;