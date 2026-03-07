import { useEffect, useMemo, useRef, useState } from "react";
import { useGetCertificatesQuery } from "../../redux/services/certificateApi";
import type { Certificate } from "../../redux/services/certificateApi";

/* ─────────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────────── */
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "top";
  className?: string;
  style?: React.CSSProperties;
}

const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  from = "bottom",
  className = "",
  style = {},
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const hiddenMap: Record<string, string> = {
    bottom: "translateY(36px)",
    top: "translateY(-36px)",
    left: "translateX(-36px)",
    right: "translateX(36px)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : hiddenMap[from],
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   3D TILT CARD
───────────────────────────────────────────────────────── */
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", style = {} }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(10px)`;
    el.style.setProperty("--csc-mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--csc-my", `${e.clientY - rect.top}px`);
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: "transform 0.20s ease", willChange: "transform" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
function fmtDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function certIsExpired(iso: string | undefined): boolean {
  if (!iso) return false;
  try {
    return new Date(iso) < new Date();
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────
   CERT CARD
───────────────────────────────────────────────────────── */
interface CertCardProps {
  cert: Certificate;
  index: number;
}

const CertCard: React.FC<CertCardProps> = ({ cert, index }) => {
  const expired = certIsExpired(cert.expiry_date);

  return (
    <Reveal delay={index * 0.065} style={{ height: "100%" }}>
      <TiltCard className={`csc-card${expired ? " csc-card--expired" : ""}`}>
        {/* Aurora cursor glow */}
        <div className="csc-aurora" />

        {/* Top gradient bar */}
        <div className={`csc-topbar${cert.is_featured ? " csc-topbar--gold" : ""}`} />

        {/* Thumbnail */}
        <div className="csc-thumb">
          {cert.thumbnail_url ? (
            <img
              src={cert.thumbnail_url}
              alt={cert.name}
              className="csc-thumb__img"
            />
          ) : (
            <div className="csc-thumb__placeholder" aria-hidden="true">
              🎓
            </div>
          )}
          {cert.is_featured && (
            <span className="csc-badge csc-badge--feat">⭐ Featured</span>
          )}
          {cert.expiry_date && expired && (
            <span className="csc-badge csc-badge--exp">Expired</span>
          )}
          {cert.expiry_date && !expired && (
            <span className="csc-badge csc-badge--valid">✓ Valid</span>
          )}
        </div>

        {/* Body */}
        <div className="csc-body">
          <h3 className="csc-name">{cert.name}</h3>

          {cert.organization && (
            <p className="csc-org">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {cert.organization}
            </p>
          )}

          {cert.description && (
            <p className="csc-desc">{cert.description}</p>
          )}

          {/* Dates */}
          <div className="csc-dates">
            {cert.issue_date && (
              <div className="csc-date-row">
                <span className="csc-date-lbl">Issued</span>
                <span className="csc-date-val">{fmtDate(cert.issue_date)}</span>
              </div>
            )}
            {cert.expiry_date && (
              <div
                className={`csc-date-row${expired ? " csc-date-row--exp" : ""}`}
              >
                <span className="csc-date-lbl">
                  {expired ? "Expired" : "Valid until"}
                </span>
                <span className="csc-date-val">
                  {fmtDate(cert.expiry_date)}
                </span>
              </div>
            )}
          </div>

          {/* Credential ID chip */}
          {cert.credential_id && (
            <div className="csc-cred-id">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
              <span>{cert.credential_id}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="csc-footer">
          {cert.credential_url && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noreferrer"
              className="csc-btn csc-btn--verify"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Verify
            </a>
          )}
          {cert.certificate_url && (
            <a
              href={cert.certificate_url}
              target="_blank"
              rel="noreferrer"
              className="csc-btn csc-btn--view"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Certificate
            </a>
          )}
        </div>
      </TiltCard>
    </Reveal>
  );
};

/* ─────────────────────────────────────────────────────────
   CERTIFICATES SECTION
───────────────────────────────────────────────────────── */
const CertificatesSection: React.FC = () => {
  const { data: allCerts = [], isLoading } = useGetCertificatesQuery({});

  const [filter, setFilter] = useState<"featured" | "all">("featured");

  /* Aurora: track mouse over all cards */
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".csc-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--csc-mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--csc-my", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const featured = useMemo(
    () => allCerts.filter((c) => c.is_featured),
    [allCerts]
  );

  const displayed = useMemo(
    () =>
      filter === "featured" && featured.length > 0
        ? featured
        : allCerts,
    [filter, featured, allCerts]
  );

  /* unique issuer count */
  const issuerCount = useMemo(
    () =>
      new Set(
        allCerts.map((c) => c.organization).filter((o): o is string =>
          Boolean(o)
        )
      ).size,
    [allCerts]
  );

  const validCount = useMemo(
    () => allCerts.filter((c) => !certIsExpired(c.expiry_date)).length,
    [allCerts]
  );

  /* ── Loading ── */
  if (isLoading) {
    return (
      <section className="section bg-light-grey" id="certificates">
        <div className="csc-loader" aria-label="Loading certificates">
          <span className="csc-loader__dot" />
          <span className="csc-loader__dot" />
          <span className="csc-loader__dot" />
        </div>
      </section>
    );
  }

  /* ── No certs → render nothing ── */
  if (allCerts.length === 0) return null;

  const stats: { icon: string; val: number; lbl: string }[] = [
    { icon: "🏆", val: allCerts.length, lbl: "Total" },
    { icon: "⭐", val: featured.length, lbl: "Featured" },
    { icon: "✅", val: validCount, lbl: "Valid" },
    { icon: "🏢", val: issuerCount, lbl: "Issuers" },
  ];

  return (
    <section className="section bg-light-grey" id="certificates">

      {/* Header */}
      <Reveal className="section-header">
        <p className="section-eyebrow">CREDENTIALS</p>
        <h2>
          Certificates &amp; <span className="gradient-text">Achievements</span>
        </h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          {allCerts.length} credential{allCerts.length !== 1 ? "s" : ""}
          {featured.length > 0 ? ` · ${featured.length} featured` : ""}
        </p>
      </Reveal>

      {/* Stats row */}
      <Reveal
        delay={0.06}
        style={{ width: "100%", maxWidth: 1100, marginBottom: 32 }}
      >
        <div className="csc-stats">
          {stats.map(({ icon, val, lbl }, idx) => (
            <div
              key={lbl}
              className="csc-stat"
              style={{ animationDelay: `${idx * 0.07}s` }}
            >
              <span className="csc-stat__icon">{icon}</span>
              <span className="csc-stat__val gradient-text">{val}</span>
              <span className="csc-stat__lbl">{lbl}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Filter pills — only shown when both groups exist */}
      {featured.length > 0 && allCerts.length > featured.length && (
        <Reveal
          delay={0.1}
          style={{ display: "flex", gap: 8, marginBottom: 32 }}
        >
          {(["featured", "all"] as const).map((f) => (
            <button
              key={f}
              className={`csc-pill${filter === f ? " csc-pill--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "featured"
                ? `⭐ Featured (${featured.length})`
                : `All (${allCerts.length})`}
            </button>
          ))}
        </Reveal>
      )}

      {/* Cards grid */}
      <div
        className="csc-grid"
        style={{ maxWidth: 1100, width: "100%" }}
      >
        {displayed.map((cert, i) => (
          <CertCard key={cert.certificate_id} cert={cert} index={i} />
        ))}
      </div>

      {/* ── STYLES ── */}
      <style>{`
        /* Keyframes */
        @keyframes csc-dot    { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
        @keyframes csc-pill   { from{opacity:0;transform:scale(.82) translateX(-4px)} to{opacity:1;transform:none} }
        @keyframes csc-topbar { 0%,100%{opacity:.75} 50%{opacity:1} }
        @keyframes csc-shimmer{ 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(220%) skewX(-15deg)} }
        @keyframes csc-popin  { 0%{transform:scale(.80) translateY(14px);opacity:0} 70%{transform:scale(1.02)} 100%{transform:none;opacity:1} }

        /* Loader */
        .csc-loader {
          display:flex; gap:10px; padding:80px 0;
          justify-content:center; align-items:center;
        }
        .csc-loader__dot {
          display:inline-block; width:9px; height:9px; border-radius:50%;
          background:var(--li-purple);
          animation:csc-dot 1.2s ease-in-out infinite;
        }
        .csc-loader__dot:nth-child(2){ animation-delay:.16s; }
        .csc-loader__dot:nth-child(3){ animation-delay:.32s; }

        /* Stats */
        .csc-stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
        }
        .csc-stat {
          background:white; border:1px solid var(--li-border); border-radius:14px;
          padding:18px 20px;
          display:flex; flex-direction:column; gap:4px;
          box-shadow:0 4px 12px rgba(2,6,23,.04);
          animation:csc-popin .45s cubic-bezier(.34,1.56,.64,1) both;
          transition:transform .20s ease, box-shadow .20s ease;
        }
        .csc-stat:hover {
          transform:translateY(-3px);
          box-shadow:0 12px 28px rgba(62,24,249,.10);
        }
        .csc-stat__icon { font-size:22px; margin-bottom:2px; }
        .csc-stat__val  { font-size:28px; font-weight:900; letter-spacing:-.04em; line-height:1; }
        .csc-stat__lbl  {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.07em;
        }

        /* Filter pills */
        .csc-pill {
          padding:7px 18px; border-radius:999px;
          border:1px solid var(--li-border); background:white;
          color:var(--li-text-muted); font-size:12px; font-weight:800;
          cursor:pointer; font-family:'IBM Plex Mono',monospace;
          animation:csc-pill .35s cubic-bezier(.34,1.56,.64,1) both;
          transition:all .18s ease;
        }
        .csc-pill:hover {
          border-color:var(--li-purple); color:var(--li-purple);
          transform:translateY(-1px);
        }
        .csc-pill--active {
          background:var(--li-purple); color:white;
          border-color:var(--li-purple);
          box-shadow:0 4px 14px rgba(62,24,249,.28);
        }
        .csc-pill--active:hover { color:white; transform:none; }

        /* Grid */
        .csc-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(290px,1fr));
          gap:20px;
          align-items:start;
        }

        /* Card */
        .csc-card {
          background:white;
          border-radius:16px;
          border:1px solid var(--li-border);
          box-shadow:0 6px 22px rgba(2,6,23,.05);
          display:flex; flex-direction:column;
          overflow:hidden;
          cursor:default;
          position:relative;
          transition:box-shadow .22s ease;
        }
        .csc-card:hover {
          box-shadow:0 22px 52px rgba(62,24,249,.12);
        }
        .csc-card--expired {
          opacity:.65; filter:saturate(.5);
        }
        .csc-card--expired:hover {
          opacity:.85; filter:saturate(.75);
        }

        /* Aurora cursor overlay */
        .csc-aurora {
          position:absolute; inset:0; border-radius:inherit;
          background:radial-gradient(
            500px circle at var(--csc-mx, 50%) var(--csc-my, 50%),
            rgba(62,24,249,.12),
            transparent 42%
          );
          pointer-events:none; z-index:1;
          transition:opacity .2s;
        }

        /* Top gradient bar */
        .csc-topbar {
          height:3px; flex-shrink:0;
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan));
          position:relative; overflow:hidden;
          animation:csc-topbar 3s ease-in-out infinite;
        }
        .csc-topbar::after {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
          animation:csc-shimmer 2.5s ease-in-out infinite;
        }
        .csc-topbar--gold {
          background:linear-gradient(90deg,#f59e0b,#fbbf24);
        }

        /* Thumbnail */
        .csc-thumb {
          height:148px; overflow:hidden; flex-shrink:0;
          position:relative;
          background:linear-gradient(135deg,rgba(62,24,249,.06),rgba(55,215,250,.06));
        }
        .csc-thumb__img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform .4s ease;
        }
        .csc-card:hover .csc-thumb__img { transform:scale(1.05); }
        .csc-thumb__placeholder {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          font-size:40px;
        }

        /* Badges on thumbnail */
        .csc-badge {
          position:absolute;
          font-size:10px; font-weight:800;
          padding:4px 9px; border-radius:999px;
          font-family:'IBM Plex Mono',monospace;
          letter-spacing:.02em;
        }
        .csc-badge--feat  { top:10px; left:10px;  background:rgba(245,158,11,.90); color:#78350f; }
        .csc-badge--exp   { top:10px; right:10px; background:rgba(239,68,68,.90);  color:#fff; }
        .csc-badge--valid { top:10px; right:10px; background:rgba(34,197,94,.90);  color:#fff; }

        /* Body */
        .csc-body {
          padding:16px;
          display:flex; flex-direction:column; gap:8px;
          flex:1; position:relative; z-index:2;
        }
        .csc-name {
          font-size:15px; font-weight:800; margin:0;
          line-height:1.3; letter-spacing:-.02em;
        }
        .csc-org {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          color:var(--li-purple); margin:0;
          display:flex; align-items:center; gap:5px;
        }
        .csc-desc {
          font-size:12px; color:var(--li-text-muted); margin:0; line-height:1.55;
          display:-webkit-box; -webkit-line-clamp:2;
          -webkit-box-orient:vertical; overflow:hidden;
        }

        /* Dates */
        .csc-dates { display:flex; flex-direction:column; gap:4px; }
        .csc-date-row {
          display:flex; align-items:center;
          justify-content:space-between; gap:6px;
        }
        .csc-date-lbl {
          font-family:'IBM Plex Mono',monospace; font-size:10px;
          font-weight:700; color:var(--li-text-muted);
        }
        .csc-date-val {
          font-family:'IBM Plex Mono',monospace; font-size:11px;
          font-weight:800; color:var(--li-text-main);
        }
        .csc-date-row--exp .csc-date-val { color:#ef4444; }

        /* Credential ID */
        .csc-cred-id {
          display:flex; align-items:center; gap:5px;
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700;
          color:var(--li-text-muted);
          background:rgba(15,23,42,.04);
          padding:5px 9px; border-radius:6px;
          border:1px solid var(--li-border);
          word-break:break-all; margin-top:2px;
        }

        /* Footer */
        .csc-footer {
          display:flex; gap:8px; padding:10px 14px;
          border-top:1px solid var(--li-border);
          position:relative; z-index:2;
        }
        .csc-btn {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 13px; border-radius:6px; border:1px solid;
          font-size:11px; font-weight:800; text-decoration:none;
          font-family:'IBM Plex Mono',monospace;
          transition:all .18s ease;
        }
        .csc-btn--verify {
          color:var(--li-purple);
          border-color:rgba(62,24,249,.25);
          background:rgba(62,24,249,.05);
        }
        .csc-btn--verify:hover {
          background:rgba(62,24,249,.13);
          transform:translateY(-1px);
        }
        .csc-btn--view {
          color:var(--li-text-muted);
          border-color:var(--li-border);
          background:transparent;
        }
        .csc-btn--view:hover {
          color:var(--li-text-main);
          border-color:rgba(15,23,42,.3);
          transform:translateY(-1px);
        }

        /* Responsive */
        @media (max-width:900px) {
          .csc-stats { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:600px) {
          .csc-grid  { grid-template-columns:1fr; }
          .csc-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
          .csc-stat  { padding:14px 16px; }
        }
      `}</style>
    </section>
  );
};

export default CertificatesSection;