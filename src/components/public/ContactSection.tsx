import { useEffect, useRef, useState } from "react";
import { useGetProfileQuery }      from "../../redux/services/profileApi";
import { useGetCertificatesQuery } from "../../redux/services/certificateApi";

/* ─── Scroll-reveal ─── */
const Reveal = ({
  children, delay = 0, className = "", style = {},
}: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(30px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
};

/* ─── 3D tilt ─── */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(6px)`;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateZ(0)";
  };
  return (
    <div ref={ref} className={className}
      style={{ ...style, transition: "transform 0.22s ease", willChange: "transform" }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
};

/* ─── Social button ─── */
const SocialBtn = ({
  href, label, icon, accent,
}: { href: string; label: string; icon: React.ReactNode; accent?: string }) => (
  <a href={href} target="_blank" rel="noreferrer"
    className="cs-social-btn"
    style={{ "--accent": accent || "var(--li-purple)" } as React.CSSProperties}
  >
    {icon}
    <span>{label}</span>
    <span className="cs-social-arrow">→</span>
  </a>
);

const ContactSection = () => {
  const { data: profile }    = useGetProfileQuery();
  const { data: certs = [] } = useGetCertificatesQuery({ featured: true });

  const email    = profile?.email;
  const phone    = profile?.phone;
  const location = profile?.location;
  const social   = profile?.social_links || {};
  const resume   = profile?.resume_url;
  const name     = profile?.full_name?.split(" ")[0] || "Me";

  return (
    <section className="section contact" id="contact">

      <Reveal className="section-header">
        <h2>Let's <span className="gradient-text">Connect</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          Ready to build the next generation of AI applications?
        </p>
      </Reveal>

      {/* ══ Main contact card ══ */}
      <Reveal delay={0.12} style={{ width: "100%", maxWidth: 900 }}>
        <TiltCard className="cs-card">
          {/* Animated gradient border */}
          <div className="cs-grad-border" />

          {/* Aurora cursor overlay */}
          <div className="cs-aurora" />

          <div className="cs-card-inner">

            {/* LEFT — info */}
            <div className="cs-left">
              <div className="cs-avatar">
                {profile?.profile_photo
                  ? <img src={profile.profile_photo} alt={name} className="cs-avatar-img" />
                  : <span className="gradient-text">{name.charAt(0)}</span>
                }
                <div className="cs-avatar-ring" />
              </div>

              <h3 className="cs-heading">
                Let's work together on something great
              </h3>
              <p className="cs-sub">
                I'm currently open for freelance work, full-time roles, and exciting collaborations.
              </p>

              {/* Contact details */}
              <div className="cs-details">
                {email && (
                  <a href={`mailto:${email}`} className="cs-detail">
                    <span className="cs-detail-icon">✉️</span>
                    <div>
                      <span className="cs-detail-lbl">Email</span>
                      <span className="cs-detail-val">{email}</span>
                    </div>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="cs-detail">
                    <span className="cs-detail-icon">📞</span>
                    <div>
                      <span className="cs-detail-lbl">Phone</span>
                      <span className="cs-detail-val">{phone}</span>
                    </div>
                  </a>
                )}
                {location && (
                  <div className="cs-detail">
                    <span className="cs-detail-icon">📍</span>
                    <div>
                      <span className="cs-detail-lbl">Location</span>
                      <span className="cs-detail-val">{location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — CTAs */}
            <div className="cs-right">
              <p className="cs-right-label">FIND ME ON</p>

              <div className="cs-socials">
                {social.github && (
                  <SocialBtn href={social.github} label="GitHub" accent="#0F172A"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>}
                  />
                )}
                {social.linkedin && (
                  <SocialBtn href={social.linkedin} label="LinkedIn" accent="#0077B5"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                  />
                )}
                {social.twitter && (
                  <SocialBtn href={social.twitter} label="Twitter / X" accent="#000"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                  />
                )}
                {social.instagram && (
                  <SocialBtn href={social.instagram} label="CHHAVA.AI — Instagram" accent="#c026d3"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>}
                  />
                )}
              </div>

              {/* Primary CTA */}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {email && (
                  <a href={`mailto:${email}`} className="primary-btn cs-cta-btn">
                    Send Message 🚀
                  </a>
                )}
                {resume && (
                  <a href={resume} target="_blank" rel="noreferrer" className="outline-btn cs-cta-btn">
                    Download Resume ↓
                  </a>
                )}
              </div>
            </div>
          </div>
        </TiltCard>
      </Reveal>

      {/* ══ Certificates strip ══ */}
      {certs.length > 0 && (
        <Reveal delay={0.22} style={{ width: "100%", maxWidth: 900, marginTop: 32 }}>
          <div className="cs-certs-label">CREDENTIALS & CERTIFICATIONS</div>
          <div className="cs-certs-strip">
            {certs.slice(0, 5).map((c, i) => (
              <div
                key={c.certificate_id}
                className="cs-cert-chip"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {c.thumbnail_url
                  ? <img src={c.thumbnail_url} alt={c.name} className="cs-cert-logo" />
                  : <span className="cs-cert-icon">🎓</span>
                }
                <div className="cs-cert-info">
                  <span className="cs-cert-name">{c.name}</span>
                  {c.organization && <span className="cs-cert-org">{c.organization}</span>}
                </div>
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noreferrer" className="cs-cert-verify">↗</a>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* ══ Copyright footer ══ */}
      <Reveal delay={0.30} style={{ marginTop: 48, textAlign: "center" }}>
        <p className="cs-footer-text">
          Designed & built by{" "}
          <span className="gradient-text" style={{ fontWeight: 800 }}>
            {profile?.full_name || "Vaibhav Jare"}
          </span>
          {" · "}
          <a href="https://instagram.com/chhava.ai" target="_blank" rel="noreferrer"
            style={{ color: "var(--li-purple)", fontWeight: 700, textDecoration: "none" }}>
            CHHAVA.AI
          </a>
        </p>
      </Reveal>

      <style>{`
        @keyframes cs-grad    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes cs-ring    { 0%{transform:scale(1);opacity:.6} 50%{transform:scale(1.12);opacity:.2} 100%{transform:scale(1);opacity:.6} }
        @keyframes cs-cert-in { from{opacity:0;transform:translateY(14px) scale(0.94)} to{opacity:1;transform:none} }

        /* Card wrapper */
        .cs-card {
          position:relative; width:100%; border-radius:22px;
          background:white; border:1px solid var(--li-border);
          box-shadow:0 28px 70px rgba(62,24,249,0.08);
          overflow:hidden; cursor:default;
        }

        /* Animated gradient top border */
        .cs-grad-border {
          position:absolute; top:0; left:0; right:0; height:4px; z-index:5;
          background:linear-gradient(90deg,var(--li-purple),var(--li-cyan),var(--li-pink),var(--li-purple));
          background-size:300% 100%;
          animation:cs-grad 4s ease infinite;
        }

        /* Aurora cursor */
        .cs-aurora {
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background:radial-gradient(700px circle at var(--mx,50%) var(--my,50%), rgba(62,24,249,0.05), transparent 45%);
        }

        /* Inner layout */
        .cs-card-inner {
          position:relative; z-index:2;
          display:flex; gap:48px; padding:44px 48px; flex-wrap:wrap;
        }

        /* Left */
        .cs-left  { flex:1; min-width:220px; display:flex; flex-direction:column; gap:20px; }
        .cs-right { display:flex; flex-direction:column; gap:12px; min-width:220px; }

        /* Avatar */
        .cs-avatar {
          position:relative; width:72px; height:72px;
          border-radius:50%; overflow:hidden;
          background:linear-gradient(135deg,rgba(62,24,249,.10),rgba(55,215,250,.10));
          display:flex; align-items:center; justify-content:center;
          font-size:28px; font-weight:900;
          box-shadow:0 8px 24px rgba(62,24,249,0.18);
          flex-shrink:0;
        }
        .cs-avatar-img { width:100%; height:100%; object-fit:cover; }
        .cs-avatar-ring {
          position:absolute; inset:-4px; border-radius:50%;
          border:2px solid var(--li-purple); opacity:.5;
          animation:cs-ring 3s ease-in-out infinite;
        }

        .cs-heading { font-size:20px; font-weight:900; margin:0; letter-spacing:-0.02em; line-height:1.3; }
        .cs-sub     { font-size:14px; color:var(--li-text-muted); margin:0; line-height:1.65; }

        /* Details */
        .cs-details { display:flex; flex-direction:column; gap:14px; }
        .cs-detail  {
          display:flex; align-items:flex-start; gap:12px;
          text-decoration:none; color:inherit;
          transition:transform .18s;
        }
        .cs-detail:hover { transform:translateX(4px); }
        .cs-detail-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
        .cs-detail-lbl  { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--li-text-muted); text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
        .cs-detail-val  { display:block; font-size:14px; font-weight:700; color:var(--li-text-main); }

        /* Section label */
        .cs-right-label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--li-purple); letter-spacing:.12em; text-transform:uppercase; margin:0;
          padding-bottom:8px; border-bottom:1px solid rgba(62,24,249,.12);
        }

        /* Social buttons */
        .cs-socials { display:flex; flex-direction:column; gap:8px; }
        .cs-social-btn {
          display:flex; align-items:center; gap:10px;
          padding:10px 16px; border-radius:9px;
          border:1px solid var(--li-border); background:var(--li-bg);
          font-size:13px; font-weight:700; color:var(--li-text-muted);
          text-decoration:none;
          transition:all .20s ease;
          position:relative; overflow:hidden;
        }
        .cs-social-btn::after {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
          transform:translateX(-100%); transition:transform .4s ease;
        }
        .cs-social-btn:hover::after { transform:translateX(100%); }
        .cs-social-btn:hover {
          border-color:var(--accent,var(--li-purple));
          color:var(--accent,var(--li-purple));
          background:rgba(62,24,249,.04);
          transform:translateX(4px);
        }
        .cs-social-arrow { margin-left:auto; opacity:.5; font-size:14px; }

        /* CTA buttons — override width */
        .cs-cta-btn { width:100%; justify-content:center; }

        /* Certificates strip */
        .cs-certs-label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--li-text-muted); letter-spacing:.12em; text-transform:uppercase;
          margin-bottom:14px;
        }
        .cs-certs-strip { display:flex; flex-wrap:wrap; gap:10px; }
        .cs-cert-chip {
          display:flex; align-items:center; gap:10px;
          background:white; border:1px solid var(--li-border); border-radius:10px;
          padding:10px 14px; flex:1; min-width:200px;
          box-shadow:0 3px 10px rgba(0,0,0,0.04);
          animation:cs-cert-in .5s cubic-bezier(.22,1,.36,1) both;
          transition:transform .18s ease, box-shadow .18s ease;
        }
        .cs-cert-chip:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(62,24,249,.10); }
        .cs-cert-logo { width:36px; height:36px; object-fit:contain; border-radius:6px; flex-shrink:0; }
        .cs-cert-icon { font-size:24px; flex-shrink:0; }
        .cs-cert-info { flex:1; min-width:0; }
        .cs-cert-name { display:block; font-size:12px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cs-cert-org  { display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:700; color:var(--li-purple); }
        .cs-cert-verify {
          font-size:12px; font-weight:800; color:var(--li-purple);
          text-decoration:none; padding:4px 9px; border-radius:6px;
          border:1px solid rgba(62,24,249,.2); background:rgba(62,24,249,.06);
          flex-shrink:0; transition:all .15s;
        }
        .cs-cert-verify:hover { background:rgba(62,24,249,.14); }

        /* Footer */
        .cs-footer-text {
          font-family:'IBM Plex Mono',monospace; font-size:13px;
          color:var(--li-text-muted); margin:0;
        }

        /* Responsive */
        @media(max-width:640px){
          .cs-card-inner { padding:28px 20px; flex-direction:column; gap:28px; }
          .cs-certs-strip { flex-direction:column; }
        }
      `}</style>
    </section>
  );
};

export default ContactSection;