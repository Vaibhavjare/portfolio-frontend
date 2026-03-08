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
    }, { threshold: 0.10 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      ...style, opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(30px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

/* ─── 3-D tilt card ─── */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
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

/* ─── Social link button ─── */
const SocialBtn = ({
  href, label, icon, accent,
}: { href: string; label: string; icon: React.ReactNode; accent?: string }) => (
  <a href={href} target="_blank" rel="noreferrer"
    className="cs-social-btn"
    style={{ "--accent": accent || "var(--li-purple)" } as React.CSSProperties}
  >
    <span className="cs-social-icon-wrap">{icon}</span>
    <span className="cs-social-label">{label}</span>
    <svg className="cs-social-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
    </svg>
  </a>
);

/* ══════════════════════════════════════════
   ContactSection
   • NO footer / copyright text inside here.
   • The one Footer component in Home.tsx handles all footer content.
   • CHHAVA.AI is completely removed.
══════════════════════════════════════════ */
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
        <p className="section-eyebrow">GET IN TOUCH</p>
        <h2>Let's <span className="gradient-text">Connect</span></h2>
        <p className="subtitle" style={{ margin: "12px auto 0" }}>
          Ready to build the next generation of AI applications?
        </p>
      </Reveal>

      {/* ── Main card ── */}
      <Reveal delay={0.12} style={{ width: "100%", maxWidth: 900 }}>
        <TiltCard className="cs-card">
          <div className="cs-grad-border" />
          <div className="cs-aurora" />

          <div className="cs-card-inner">

            {/* LEFT */}
            <div className="cs-left">

              {/* Avatar */}
              <div className="cs-avatar">
                {profile?.profile_photo
                  ? <img src={profile.profile_photo} alt={name} className="cs-avatar-img" />
                  : <span className="gradient-text cs-avatar-initial">{name.charAt(0)}</span>
                }
                <div className="cs-avatar-ring  cs-ring1" />
                <div className="cs-avatar-ring  cs-ring2" />
              </div>

              {/* Status */}
              <div className="cs-status-badge">
                <span className="dot" />
                <span>Available for work</span>
              </div>

              <h3 className="cs-heading">Let's work together on something great</h3>
              <p  className="cs-sub">
                Open for freelance work, full-time roles, and exciting collaborations.
              </p>

              {/* Contact rows */}
              <div className="cs-details">
                {email && (
                  <a href={`mailto:${email}`} className="cs-detail cs-detail--link">
                    <div className="cs-detail-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div className="cs-detail-text">
                      <span className="cs-detail-lbl">Email</span>
                      <span className="cs-detail-val">{email}</span>
                    </div>
                    <span className="cs-detail-caret">→</span>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="cs-detail cs-detail--link">
                    <div className="cs-detail-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div className="cs-detail-text">
                      <span className="cs-detail-lbl">Phone</span>
                      <span className="cs-detail-val">{phone}</span>
                    </div>
                    <span className="cs-detail-caret">→</span>
                  </a>
                )}
                {location && (
                  <div className="cs-detail">
                    <div className="cs-detail-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="cs-detail-text">
                      <span className="cs-detail-lbl">Location</span>
                      <span className="cs-detail-val">{location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
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
                  <SocialBtn href={social.instagram} label="Instagram" accent="#c026d3"
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>}
                  />
                )}
              </div>

              {/* CTA buttons with SVG icons */}
              <div className="cs-ctas">
                {email && (
                  <a href={`mailto:${email}`} className="primary-btn cs-cta-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Send Message
                  </a>
                )}
                {resume && (
                  <a href={resume} target="_blank" rel="noreferrer" className="outline-btn cs-cta-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </TiltCard>
      </Reveal>

      {/* ── Featured certs strip ── */}
      {certs.length > 0 && (
        <Reveal delay={0.22} style={{ width: "100%", maxWidth: 900, marginTop: 32 }}>
          <p className="cs-certs-label">CREDENTIALS &amp; CERTIFICATIONS</p>
          <div className="cs-certs-strip">
            {certs.slice(0, 5).map((c, i) => (
              <div key={c.certificate_id} className="cs-cert-chip"
                style={{ animationDelay: `${i * 0.06}s` }}>
                {c.thumbnail_url
                  ? <img src={c.thumbnail_url} alt={c.name} className="cs-cert-logo" />
                  : <span className="cs-cert-icon">🎓</span>
                }
                <div className="cs-cert-info">
                  <span className="cs-cert-name">{c.name}</span>
                  {c.organization && <span className="cs-cert-org">{c.organization}</span>}
                </div>
                {c.credential_url && (
                  <a href={c.credential_url} target="_blank" rel="noreferrer"
                    className="cs-cert-verify">↗</a>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/*
        ╔══════════════════════════════════════════════════════╗
        ║  NO copyright / footer / "Designed & built by" here ║
        ║  NO CHHAVA.AI link anywhere in this file             ║
        ║  The <Footer /> component in Home.tsx handles it all ║
        ╚══════════════════════════════════════════════════════╝
      */}

      <style>{`
        @keyframes cs-grad      { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes cs-ring1-kf  { 0%,100%{transform:scale(1);   opacity:.45} 50%{transform:scale(1.16);opacity:.10} }
        @keyframes cs-ring2-kf  { 0%,100%{transform:scale(1.10);opacity:.22} 50%{transform:scale(1.26);opacity:.05} }
        @keyframes cs-cert-in   { from{opacity:0;transform:translateY(14px) scale(.94)} to{opacity:1;transform:none} }
        @keyframes cs-status-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.3)} 60%{box-shadow:0 0 0 6px rgba(16,185,129,0)} }

        /* Card */
        .cs-card {
          position: relative; width: 100%; border-radius: 22px;
          background: white; border: 1px solid var(--li-border);
          box-shadow: 0 28px 70px rgba(62,24,249,.08);
          overflow: hidden; cursor: default;
        }
        .cs-grad-border {
          position: absolute; top: 0; left: 0; right: 0; height: 4px; z-index: 5;
          background: linear-gradient(90deg,var(--li-purple),var(--li-cyan),var(--li-pink),var(--li-purple));
          background-size: 300% 100%;
          animation: cs-grad 4s ease infinite;
        }
        .cs-aurora {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(700px circle at var(--mx,50%) var(--my,50%), rgba(62,24,249,.04), transparent 45%);
        }
        .cs-card-inner {
          position: relative; z-index: 2;
          display: flex; gap: 48px; padding: 44px 48px; flex-wrap: wrap;
        }

        /* Columns */
        .cs-left  { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 18px; }
        .cs-right { display: flex; flex-direction: column; gap: 12px; min-width: 220px; }

        /* Avatar */
        .cs-avatar {
          position: relative; width: 72px; height: 72px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cs-avatar-img {
          width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
          box-shadow: 0 8px 24px rgba(62,24,249,.18); position: relative; z-index: 2;
        }
        .cs-avatar-initial {
          width: 72px; height: 72px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 28px; font-weight: 900;
          background: linear-gradient(135deg,rgba(62,24,249,.10),rgba(55,215,250,.10));
          box-shadow: 0 8px 24px rgba(62,24,249,.18); position: relative; z-index: 2;
        }
        .cs-avatar-ring {
          position: absolute; border-radius: 50%; border: 2px solid var(--li-purple);
          pointer-events: none;
        }
        .cs-ring1 { inset: -5px;  opacity: .42; animation: cs-ring1-kf 3s ease-in-out infinite; }
        .cs-ring2 { inset: -12px; opacity: .20; animation: cs-ring2-kf 3s ease-in-out infinite .6s; }

        /* Status badge */
        .cs-status-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 14px; border-radius: 999px;
          background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.22);
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700;
          color: #065f46; width: fit-content;
          animation: cs-status-pulse 2.5s ease infinite;
        }
        .cs-status-badge .dot { background: #10B981 !important; }

        .cs-heading { font-size: 20px; font-weight: 900; margin: 0; letter-spacing: -.02em; line-height: 1.3; }
        .cs-sub     { font-size: 14px; color: var(--li-text-muted); margin: 0; line-height: 1.65; }

        /* Detail rows */
        .cs-details { display: flex; flex-direction: column; gap: 6px; }
        .cs-detail  {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 10px; border-radius: 9px;
          border: 1px solid transparent; text-decoration: none; color: inherit;
          transition: all .2s ease;
        }
        .cs-detail--link:hover {
          border-color: var(--li-border);
          background: rgba(62,24,249,.025);
          transform: translateX(5px);
        }
        .cs-detail-icon-wrap {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(62,24,249,.07);
          display: flex; align-items: center; justify-content: center;
          color: var(--li-purple); transition: transform .2s;
        }
        .cs-detail--link:hover .cs-detail-icon-wrap { transform: scale(1.1); }
        .cs-detail-text { flex: 1; min-width: 0; }
        .cs-detail-lbl  { display: block; font-family: 'IBM Plex Mono',monospace; font-size: 10px; font-weight: 800; color: var(--li-text-muted); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 1px; }
        .cs-detail-val  { display: block; font-size: 14px; font-weight: 700; color: var(--li-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cs-detail-caret { opacity: 0; color: var(--li-purple); font-size: 14px; transition: opacity .18s, transform .18s; flex-shrink: 0; }
        .cs-detail--link:hover .cs-detail-caret { opacity: 1; transform: translateX(3px); }

        /* Right eyebrow */
        .cs-right-label {
          font-family: 'IBM Plex Mono',monospace; font-size: 10px; font-weight: 800;
          color: var(--li-purple); letter-spacing: .12em; text-transform: uppercase;
          margin: 0; padding-bottom: 8px; border-bottom: 1px solid rgba(62,24,249,.12);
        }

        /* Social buttons */
        .cs-socials { display: flex; flex-direction: column; gap: 8px; }
        .cs-social-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 9px;
          border: 1px solid var(--li-border); background: white;
          text-decoration: none; color: var(--li-text-muted);
          font-size: 13px; font-weight: 700;
          transition: all .22s ease;
          position: relative; overflow: hidden;
        }
        .cs-social-btn::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
          transform: translateX(-100%); transition: transform .45s ease;
        }
        .cs-social-btn:hover::before { transform: translateX(100%); }
        .cs-social-btn:hover {
          border-color: var(--accent,var(--li-purple));
          color: var(--accent,var(--li-purple));
          background: rgba(62,24,249,.025);
          transform: translateX(5px);
          box-shadow: 0 4px 14px rgba(62,24,249,.09);
        }
        .cs-social-icon-wrap {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          background: rgba(62,24,249,.07);
          display: flex; align-items: center; justify-content: center;
          transition: transform .2s;
        }
        .cs-social-btn:hover .cs-social-icon-wrap { transform: scale(1.1); }
        .cs-social-label { flex: 1; }
        .cs-social-arrow { flex-shrink: 0; opacity: .4; transition: opacity .18s, transform .18s; }
        .cs-social-btn:hover .cs-social-arrow { opacity: .85; transform: translate(2px,-2px); }

        /* CTA buttons */
        .cs-ctas { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
        .cs-cta-btn {
          width: 100%; justify-content: center !important;
          transition: all .26s cubic-bezier(.34,1.56,.64,1) !important;
        }
        .cs-cta-btn:hover { transform: translateY(-3px) scale(1.02) !important; }

        /* Cert strip */
        .cs-certs-label {
          font-family: 'IBM Plex Mono',monospace; font-size: 10px; font-weight: 800;
          color: var(--li-text-muted); letter-spacing: .12em; text-transform: uppercase;
          margin-bottom: 14px;
        }
        .cs-certs-strip { display: flex; flex-wrap: wrap; gap: 10px; }
        .cs-cert-chip {
          display: flex; align-items: center; gap: 10px;
          background: white; border: 1px solid var(--li-border); border-radius: 10px;
          padding: 10px 14px; flex: 1; min-width: 200px;
          box-shadow: 0 3px 10px rgba(0,0,0,.04);
          animation: cs-cert-in .5s cubic-bezier(.22,1,.36,1) both;
          transition: transform .18s, box-shadow .18s;
        }
        .cs-cert-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(62,24,249,.10); }
        .cs-cert-logo  { width: 36px; height: 36px; object-fit: contain; border-radius: 6px; flex-shrink: 0; }
        .cs-cert-icon  { font-size: 24px; flex-shrink: 0; }
        .cs-cert-info  { flex: 1; min-width: 0; }
        .cs-cert-name  { display: block; font-size: 12px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cs-cert-org   { display: block; font-family: 'IBM Plex Mono',monospace; font-size: 10px; font-weight: 700; color: var(--li-purple); }
        .cs-cert-verify {
          font-size: 12px; font-weight: 800; color: var(--li-purple); text-decoration: none;
          padding: 4px 9px; border-radius: 6px;
          border: 1px solid rgba(62,24,249,.2); background: rgba(62,24,249,.06);
          flex-shrink: 0; transition: all .15s;
        }
        .cs-cert-verify:hover { background: rgba(62,24,249,.14); }

        @media (max-width: 640px) {
          .cs-card-inner  { padding: 28px 20px; flex-direction: column; gap: 28px; }
          .cs-certs-strip { flex-direction: column; }
        }
      `}</style>
    </section>
  );
};

export default ContactSection;