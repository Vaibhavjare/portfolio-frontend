import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";

/* ── API hooks ── */
import { useGetProfileQuery }      from "../redux/services/profileApi";
import { useGetProjectsQuery }     from "../redux/services/projectApi";
import { useGetSkillsQuery }       from "../redux/services/skillApi";
import { useGetCertificatesQuery } from "../redux/services/certificateApi";

/* ── Types ── */
import type { Project }     from "../redux/services/projectApi";
import type { Skill }       from "../redux/services/skillApi";
import type { Certificate } from "../redux/services/certificateApi";

/* ══════════════════════════════════════════════════════════
   3D FLOATING ORBS — pure CSS/JS, no external 3D lib needed
══════════════════════════════════════════════════════════ */
const FloatingOrb = ({
  size, color, top, left, delay, duration,
}: { size: number; color: string; top: string; left: string; delay: number; duration: number }) => (
  <div
    style={{
      position: "absolute", width: size, height: size, top, left,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}22)`,
      filter: `blur(${size * 0.18}px)`,
      opacity: 0.55,
      animation: `orbFloat ${duration}s ease-in-out infinite alternate`,
      animationDelay: `${delay}s`,
      pointerEvents: "none",
      zIndex: 0,
    }}
  />
);

/* ══════════════════════════════════════════════════════════
   3D TILT CARD
══════════════════════════════════════════════════════════ */
const TiltCard = ({
  children, className = "", style = {},
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transition: "transform 0.18s ease", willChange: "transform" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════ */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = () => {
        start += Math.ceil(to / 40);
        if (start >= to) { setVal(to); return; }
        setVal(start); requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ══════════════════════════════════════════════════════════
   SCROLL-REVEAL WRAPPER
══════════════════════════════════════════════════════════ */
const Reveal = ({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) => {
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
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PROFICIENCY COLOR
══════════════════════════════════════════════════════════ */
const PROF_COLOR: Record<string, string> = {
  Beginner: "#94a3b8", Elementary: "#38bdf8",
  Intermediate: "#f59e0b", Advanced: "#22c55e", Expert: "#3E18F9",
};

/* ══════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════ */
const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const heroRef = useRef<HTMLDivElement>(null);

  /* API data */
  const { data: profile }  = useGetProfileQuery();
  const { data: allProjects = [] } = useGetProjectsQuery({});
  const { data: allSkills  = [] }  = useGetSkillsQuery({});
  const { data: allCerts   = [] }  = useGetCertificatesQuery({});

  const featuredProjects  = useMemo(() => allProjects.filter(p => p.featured).slice(0, 6),  [allProjects]);
  const activeSkills      = useMemo(() => allSkills.filter(s => s.is_active !== false).slice(0, 24), [allSkills]);
  const featuredCerts     = useMemo(() => allCerts.filter(c => c.is_featured).slice(0, 6),  [allCerts]);

  /* Group skills by category */
  const skillsByCategory = useMemo(() => {
    const map: Record<string, Skill[]> = {};
    activeSkills.forEach(s => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [activeSkills]);

  /* Scroll tracking */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ["home", "about", "skills", "portfolio", "certificates", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Parallax on hero */
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current)
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name    = profile?.full_name || "Vaibhav";
  const title   = profile?.title     || "Full-Stack Developer & AI Engineer";
  const bio     = profile?.bio || profile?.objective || "Building intelligent, scalable systems at the intersection of AI and modern web.";
  const expYrs  = profile?.experience_years || 0;
  const photoUrl = profile?.profile_photo;
  const github   = profile?.social_links?.github;
  const linkedin = profile?.social_links?.linkedin;
  const resumeUrl = profile?.resume_url;

  return (
    <>
      {/* ═══════════ NAVBAR ═══════════ */}
      <header className={`top-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <a href="#home" className="nav-brand">
            <span className="font-extrabold gradient-text">{name.split(" ")[0]}</span>
            <span className="mono-text logo-suffix">.dev</span>
          </a>
          <nav className="desktop-nav">
            {[["#about","About"],["#skills","Skills"],["#portfolio","Projects"],["#certificates","Certs"],["#contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href} className={`nav-link${activeSection === href.slice(1) ? " nav-link-active" : ""}`}>{label}</a>
            ))}
            <a href="https://instagram.com/chhava.ai" target="_blank" rel="noreferrer" className="nav-link">
              CHHAVA.AI <span className="nav-badge">Educator</span>
            </a>
            <Link to="/admin/login" className="nav-link admin-link">Admin</Link>
            <a href="#contact" className="primary-btn nav-btn">Let's Talk</a>
          </nav>
        </div>
      </header>

      {/* ═══════════ AURORA BACKGROUND ═══════════ */}
      <div className="aurora-container" aria-hidden>
        <div className="glow glow-cyan"   />
        <div className="glow glow-purple" />
        <div className="glow glow-pink"   />
      </div>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="home" className="hero">
        <div ref={heroRef} className="hero-content">
          {/* Left text */}
          <div className="hero-text">
            <div className="tagline-badge">
              <span className="dot" />
              {expYrs > 0 ? `${expYrs}+ years of experience` : "Available for work"}
            </div>
            <h1>
              Hi, I'm{" "}
              <span className="gradient-text">{name.split(" ")[0]}</span>
              <br />
              <span className="hero-title-line">{title}</span>
            </h1>
            <p className="subtitle">{bio}</p>

            {/* Social + Resume links */}
            <div className="hero-social-row">
              {github && (
                <a href={github} target="_blank" rel="noreferrer" className="social-chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" className="social-chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
            </div>

            <div className="buttons">
              <a href="#portfolio" className="primary-btn">View My Work</a>
              {resumeUrl
                ? <a href={resumeUrl} target="_blank" rel="noreferrer" className="outline-btn">Download Resume</a>
                : <a href="#contact" className="outline-btn">Get In Touch</a>
              }
            </div>

            {/* Quick stats */}
            {(allProjects.length > 0 || allSkills.length > 0) && (
              <div className="hero-stats">
                {allProjects.length > 0 && (
                  <div className="hero-stat">
                    <span className="hero-stat-num gradient-text">
                      <Counter to={allProjects.length} suffix="+" />
                    </span>
                    <span className="hero-stat-lbl">Projects</span>
                  </div>
                )}
                {allSkills.length > 0 && (
                  <div className="hero-stat">
                    <span className="hero-stat-num gradient-text">
                      <Counter to={allSkills.length} suffix="+" />
                    </span>
                    <span className="hero-stat-lbl">Skills</span>
                  </div>
                )}
                {expYrs > 0 && (
                  <div className="hero-stat">
                    <span className="hero-stat-num gradient-text">
                      <Counter to={expYrs} suffix="+" />
                    </span>
                    <span className="hero-stat-lbl">Years Exp</span>
                  </div>
                )}
                {allCerts.length > 0 && (
                  <div className="hero-stat">
                    <span className="hero-stat-num gradient-text">
                      <Counter to={allCerts.length} suffix="" />
                    </span>
                    <span className="hero-stat-lbl">Certs</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — 3D profile card */}
          <div className="hero-visual">
            <div className="hero-3d-scene">
              {/* Floating background orbs */}
              <FloatingOrb size={220} color="#3E18F9" top="-10%" left="-15%" delay={0}   duration={6} />
              <FloatingOrb size={160} color="#37D7FA" top="55%"  left="65%" delay={1.5} duration={7} />
              <FloatingOrb size={100} color="#FF8DF2" top="15%"  left="70%" delay={0.8} duration={5} />

              {/* 3D profile card */}
              <TiltCard className="profile-3d-card">
                <div className="profile-card-glow" />
                {photoUrl ? (
                  <img src={photoUrl} alt={name} className="profile-card-photo" />
                ) : (
                  <div className="profile-card-placeholder">
                    <span>{name.charAt(0)}</span>
                  </div>
                )}
                <div className="profile-card-info">
                  <p className="profile-card-name">{name}</p>
                  <p className="profile-card-title">{title}</p>
                  {profile?.location && (
                    <p className="profile-card-loc">📍 {profile.location}</p>
                  )}
                </div>
                {/* Floating badges around card */}
                <div className="float-badge float-badge-1">⚡ {allSkills.length} Skills</div>
                <div className="float-badge float-badge-2">🚀 {allProjects.length} Projects</div>
                {allCerts.length > 0 && (
                  <div className="float-badge float-badge-3">🎓 {allCerts.length} Certs</div>
                )}
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="about" className="section">
        <Reveal className="section-header">
          <p className="section-eyebrow">WHO I AM</p>
          <h2>About <span className="gradient-text">Me</span></h2>
        </Reveal>

        <div className="about-grid">
          <Reveal delay={0.1} className="about-left">
            {photoUrl && (
              <TiltCard className="about-photo-wrap">
                <img src={photoUrl} alt={name} className="about-photo" />
                <div className="about-photo-badge">
                  {expYrs > 0 && <><span className="about-photo-num">{expYrs}+</span><span>Years Exp</span></>}
                </div>
              </TiltCard>
            )}
          </Reveal>

          <Reveal delay={0.2} className="about-right">
            {profile?.objective && (
              <p className="about-objective">{profile.objective}</p>
            )}
            {profile?.bio && profile.bio !== profile?.objective && (
              <p className="about-bio">{profile.bio}</p>
            )}
            <div className="about-details">
              {profile?.location && (
                <div className="about-detail-item">
                  <span className="about-detail-icon">📍</span>
                  <div>
                    <span className="about-detail-lbl">Location</span>
                    <span className="about-detail-val">{profile.location}</span>
                  </div>
                </div>
              )}
              {profile?.email && (
                <div className="about-detail-item">
                  <span className="about-detail-icon">✉️</span>
                  <div>
                    <span className="about-detail-lbl">Email</span>
                    <a href={`mailto:${profile.email}`} className="about-detail-val about-detail-link">{profile.email}</a>
                  </div>
                </div>
              )}
              {profile?.phone && (
                <div className="about-detail-item">
                  <span className="about-detail-icon">📞</span>
                  <div>
                    <span className="about-detail-lbl">Phone</span>
                    <span className="about-detail-val">{profile.phone}</span>
                  </div>
                </div>
              )}
            </div>
            {profile?.skills_summary && (
              <p className="about-skills-summary">{profile.skills_summary}</p>
            )}
            <div className="about-socials">
              {github   && <a href={github}   target="_blank" rel="noreferrer" className="social-pill">GitHub</a>}
              {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="social-pill">LinkedIn</a>}
              {profile?.social_links?.twitter   && <a href={profile.social_links.twitter}   target="_blank" rel="noreferrer" className="social-pill">Twitter</a>}
              {profile?.social_links?.instagram && <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="social-pill">Instagram</a>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SKILLS SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="skills" className="section bg-light-grey">
        <Reveal className="section-header">
          <p className="section-eyebrow">EXPERTISE</p>
          <h2>Tech <span className="gradient-text">Stack</span></h2>
          <p className="subtitle" style={{ margin: "12px auto 0" }}>
            {activeSkills.length} skills across {Object.keys(skillsByCategory).length} categories
          </p>
        </Reveal>

        {Object.keys(skillsByCategory).length > 0 ? (
          Object.entries(skillsByCategory).map(([cat, skills], catIdx) => (
            <Reveal key={cat} delay={catIdx * 0.08} style={{ width: "100%", maxWidth: 1100 }}>
              <div className="skill-category-block">
                <h3 className="skill-cat-title">{cat}</h3>
                <div className="skills-grid">
                  {skills.map((s, i) => {
                    const accent = s.color || PROF_COLOR[s.proficiency_level || ""] || "#3E18F9";
                    return (
                      <TiltCard key={s.skill_id} className="skill-badge-3d" style={{ animationDelay: `${i * 0.04}s` }}>
                        <div className="skill-badge-inner" style={{ borderColor: accent + "33" }}>
                          {s.icon_url
                            ? <img src={s.icon_url} alt={s.name} className="skill-icon-img" />
                            : <span className="skill-icon-letter" style={{ color: accent }}>{s.name.charAt(0)}</span>
                          }
                          <span className="skill-badge-name">{s.name}</span>
                          {s.rating != null && (
                            <div className="skill-badge-bar-wrap">
                              <div className="skill-badge-bar" style={{ width: `${(s.rating / 10) * 100}%`, background: accent }} />
                            </div>
                          )}
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))
        ) : (
          /* Fallback: flat grid if no categories */
          <div className="skills-grid" style={{ maxWidth: 1000 }}>
            {activeSkills.map((s, i) => (
              <Reveal key={s.skill_id} delay={i * 0.04}>
                <div className="skill-badge">{s.name}</div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          PROJECTS SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="portfolio" className="section">
        <Reveal className="section-header">
          <p className="section-eyebrow">WORK</p>
          <h2>Featured <span className="gradient-text">Projects</span></h2>
          <p className="subtitle" style={{ margin: "12px auto 0" }}>
            {featuredProjects.length > 0 ? `${featuredProjects.length} featured out of ${allProjects.length} total projects` : `${allProjects.length} projects`}
          </p>
        </Reveal>

        <div className="project-grid" style={{ maxWidth: 1100, width: "100%" }}>
          {(featuredProjects.length > 0 ? featuredProjects : allProjects.slice(0, 6)).map((p, i) => (
            <Reveal key={p.project_id} delay={i * 0.08}>
              <TiltCard className="project-card-3d">
                {/* Thumbnail */}
                {p.thumbnail_url ? (
                  <div className="proj-thumb">
                    <img src={p.thumbnail_url} alt={p.title} />
                  </div>
                ) : (
                  <div className="proj-thumb proj-thumb-placeholder">
                    <span>💻</span>
                  </div>
                )}

                <div className="proj-body">
                  {/* Complexity badge */}
                  {p.complexity_score != null && (
                    <span className={`proj-complexity proj-cx-${Math.ceil(p.complexity_score / 3.4)}`}>
                      {p.complexity_score <= 3 ? "Beginner" : p.complexity_score <= 6 ? "Intermediate" : "Advanced"}
                    </span>
                  )}

                  <h3 className="proj-title">{p.title}</h3>
                  {p.description && <p className="proj-desc">{p.description}</p>}

                  {/* Tech stack chips */}
                  {p.tech_stack && (
                    <div className="proj-tech-row">
                      {[
                        ...(p.tech_stack.programming_languages || []),
                        ...(p.tech_stack.frameworks || []),
                      ].slice(0, 5).map(t => (
                        <span key={t} className="proj-tech-chip">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {p.tags && p.tags.length > 0 && (
                    <div className="proj-tags">
                      {p.tags.slice(0, 4).map(t => (
                        <span key={t} className="proj-tag">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="proj-links">
                    {p.github_link && (
                      <a href={p.github_link} target="_blank" rel="noreferrer" className="proj-link proj-link-gh">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                        Code
                      </a>
                    )}
                    {p.live_demo_url && (
                      <a href={p.live_demo_url} target="_blank" rel="noreferrer" className="proj-link proj-link-live">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {allProjects.length > 6 && (
          <Reveal delay={0.2} style={{ marginTop: 40 }}>
            <a href="#contact" className="outline-btn">View All {allProjects.length} Projects →</a>
          </Reveal>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          CERTIFICATES SECTION
      ═══════════════════════════════════════════════════ */}
      {allCerts.length > 0 && (
        <section id="certificates" className="section bg-light-grey">
          <Reveal className="section-header">
            <p className="section-eyebrow">CREDENTIALS</p>
            <h2>Certificates & <span className="gradient-text">Achievements</span></h2>
          </Reveal>

          <div className="certs-grid" style={{ maxWidth: 1100, width: "100%" }}>
            {(featuredCerts.length > 0 ? featuredCerts : allCerts.slice(0, 6)).map((c, i) => (
              <Reveal key={c.certificate_id} delay={i * 0.07}>
                <TiltCard className="cert-card">
                  <div className="cert-card-top">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.name} className="cert-logo" />
                    ) : (
                      <div className="cert-logo-placeholder">🎓</div>
                    )}
                    <div className="cert-card-info">
                      <h3 className="cert-name">{c.name}</h3>
                      {c.organization && <p className="cert-org">{c.organization}</p>}
                    </div>
                  </div>
                  {c.description && <p className="cert-desc">{c.description}</p>}
                  <div className="cert-footer">
                    {c.issue_date && (
                      <span className="cert-date">
                        {new Date(c.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                      </span>
                    )}
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" className="cert-verify-btn">
                        Verify ↗
                      </a>
                    )}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          CONTACT SECTION
      ═══════════════════════════════════════════════════ */}
      <section id="contact" className="section">
        <Reveal className="section-header">
          <p className="section-eyebrow">GET IN TOUCH</p>
          <h2>Let's <span className="gradient-text">Work Together</span></h2>
          <p className="subtitle" style={{ margin: "12px auto 0" }}>
            Have a project in mind? I'd love to hear about it.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <TiltCard className="contact-card">
            <div className="contact-card-inner">
              <div className="contact-left">
                <h3>Ready to start something great?</h3>
                <p>I'm currently available for freelance work and full-time opportunities.</p>
                <div className="contact-links">
                  {profile?.email && (
                    <a href={`mailto:${profile.email}`} className="contact-link">
                      <span className="contact-link-icon">✉️</span>
                      {profile.email}
                    </a>
                  )}
                  {profile?.phone && (
                    <a href={`tel:${profile.phone}`} className="contact-link">
                      <span className="contact-link-icon">📞</span>
                      {profile.phone}
                    </a>
                  )}
                  {profile?.location && (
                    <div className="contact-link">
                      <span className="contact-link-icon">📍</span>
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
              <div className="contact-right">
                {github && (
                  <a href={github} target="_blank" rel="noreferrer" className="contact-social-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" className="contact-social-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                )}
                {profile?.social_links?.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noreferrer" className="contact-social-btn contact-social-ig">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                    CHHAVA.AI
                  </a>
                )}
                <a href="#home" className="primary-btn" style={{ marginTop: 8 }}>Let's Talk 🚀</a>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      </section>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="mobile-bottom-nav">
        {[
          ["#home","Home","M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"],
          ["#about","About","M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
          ["#portfolio","Work","M16 18l6-6-6-6 M8 6L2 12l6 6"],
          ["#contact","Contact","M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
        ].map(([href, label, path]) => (
          <a key={href} href={href} className={`mobile-nav-item${activeSection === href.slice(1) ? " mobile-nav-active" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={path} />
            </svg>
            <span>{label}</span>
          </a>
        ))}
        <Link to="/admin/login" className="mobile-nav-item admin-mobile">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Admin</span>
        </Link>
      </nav>

      {/* ═══════════════════════════════════════════════════
          GLOBAL STYLES
      ═══════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;800;900&display=swap');

        /* ── Variables ── */
        :root {
          --li-bg:         #FCFCFC;
          --li-card-bg:    #FFFFFF;
          --li-border:     #EFEFEF;
          --li-text-main:  #000000;
          --li-text-muted: #52525B;
          --li-cyan:       #37D7FA;
          --li-purple:     #3E18F9;
          --li-pink:       #FF8DF2;
        }

        /* ── Keyframes ── */
        @keyframes floatGlow {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes orbFloat {
          0%   { transform: translateY(0px) scale(1) rotate(0deg); }
          100% { transform: translateY(-30px) scale(1.08) rotate(5deg); }
        }
        @keyframes badgeFloat {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%     { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        @keyframes spin3d {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(360deg); }
        }

        /* ── Reset ── */
        * { box-sizing: border-box; }
        body {
          margin: 0; font-family: 'Inter', sans-serif;
          background: var(--li-bg); color: var(--li-text-main); overflow-x: hidden;
        }
        html { scroll-behavior: smooth; }
        h1,h2,h3 { font-weight: 800; letter-spacing: -0.03em; margin: 0; }

        .gradient-text {
          background: linear-gradient(90deg, var(--li-purple) 0%, var(--li-cyan) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: var(--li-text-muted); font-size: 17px; line-height: 1.65;
          max-width: 580px;
        }

        /* ── Aurora ── */
        .aurora-container {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          overflow: hidden; z-index: 0; pointer-events: none;
        }
        .glow {
          position: absolute; border-radius: 50%; filter: blur(140px);
          opacity: 0.4; mix-blend-mode: multiply;
          animation: floatGlow 10s ease-in-out infinite alternate;
        }
        .glow-cyan   { width:600px;height:600px;background:var(--li-cyan);  top:-100px;left:10%;  animation-delay:0s; }
        .glow-purple { width:500px;height:500px;background:var(--li-purple);top:20%;  left:40%;  opacity:0.3; animation-delay:-3s; }
        .glow-pink   { width:550px;height:550px;background:var(--li-pink);  top:10%;  right:10%; opacity:0.25;animation-delay:-6s; }

        /* ── Navbar ── */
        .top-navbar {
          position: fixed; top:0; left:0; width:100%; z-index:1000;
          background: rgba(252,252,252,0.88); backdrop-filter: blur(16px);
          border-bottom: 1px solid transparent; transition: all 0.3s ease;
        }
        .top-navbar.scrolled {
          border-bottom: 1px solid var(--li-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .nav-container {
          max-width: 1200px; margin: 0 auto; padding: 16px 5%;
          display: flex; justify-content: space-between; align-items: center;
        }
        .nav-brand {
          display: flex; align-items: baseline; text-decoration: none; gap: 2px;
        }
        .font-extrabold { font-weight: 900; font-size: 24px; letter-spacing: -0.04em; }
        .logo-suffix    { font-size: 14px; color: var(--li-text-muted); font-weight: 600; }
        .mono-text      { font-family: 'IBM Plex Mono', monospace; }
        .desktop-nav    { display: flex; align-items: center; gap: 28px; }
        .nav-link {
          text-decoration: none; color: var(--li-text-muted);
          font-weight: 600; font-size: 14px; transition: all 0.2s ease;
          display: flex; align-items: center; gap: 6px;
          position: relative;
        }
        .nav-link::after {
          content:""; position:absolute; bottom:-3px; left:0; width:0; height:2px;
          background:linear-gradient(90deg, var(--li-purple), var(--li-cyan));
          transition:width 0.25s ease; border-radius:1px;
        }
        .nav-link:hover { color: var(--li-text-main); }
        .nav-link:hover::after, .nav-link-active::after { width:100%; }
        .nav-link-active { color: var(--li-text-main); }
        .admin-link { font-family: 'IBM Plex Mono', monospace; color: var(--li-purple); }
        .nav-badge {
          background: rgba(55,215,250,0.15); color: #0369a1;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; font-weight: 700; padding: 2px 6px;
          border-radius: 4px; text-transform: uppercase;
        }

        /* ── Buttons ── */
        .primary-btn, .outline-btn, .nav-btn {
          padding: 12px 24px; border-radius: 6px; font-weight: 700;
          font-size: 14px; cursor: pointer; transition: all 0.22s ease;
          text-decoration: none; display: inline-flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .primary-btn {
          background: var(--li-text-main); color: #fff; border: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.10);
        }
        .primary-btn:hover {
          background: var(--li-purple); transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(62,24,249,0.25);
        }
        .primary-btn:active { transform: scale(0.97); }
        .outline-btn {
          background: white; color: var(--li-text-main);
          border: 1.5px solid var(--li-border);
        }
        .outline-btn:hover { border-color: var(--li-text-main); transform: translateY(-1px); }

        /* ── Section base ── */
        .section {
          padding: 120px 5%;
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 10;
        }
        .bg-light-grey {
          background: #F7F8FC;
          border-top: 1px solid var(--li-border);
          border-bottom: 1px solid var(--li-border);
        }
        .section-header { text-align: center; margin-bottom: 56px; width: 100%; }
        .section-header h2 { font-size: clamp(30px, 5vw, 44px); margin-bottom: 10px; }
        .section-eyebrow {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800;
          color: var(--li-purple); letter-spacing: 0.12em; text-transform: uppercase;
          margin: 0 0 12px;
        }

        /* ── Social chips ── */
        .social-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 999px;
          border: 1px solid var(--li-border); background: white;
          font-size: 13px; font-weight: 600; color: var(--li-text-muted);
          text-decoration: none; transition: all 0.2s ease;
        }
        .social-chip:hover {
          border-color: var(--li-purple); color: var(--li-purple);
          transform: translateY(-2px); box-shadow: 0 4px 12px rgba(62,24,249,0.12);
        }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 120px 5% 80px; position: relative; z-index: 10;
        }
        .hero-content {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1200px; width: 100%; gap: 60px;
        }
        .hero-text {
          flex: 1; display: flex; flex-direction: column;
          align-items: flex-start; max-width: 560px;
        }
        .hero h1 {
          font-size: clamp(42px, 5.5vw, 72px); line-height: 1.06;
          margin-bottom: 20px; font-weight: 900;
        }
        .hero-title-line {
          font-size: clamp(20px, 2.8vw, 32px); font-weight: 700;
          color: var(--li-text-muted); letter-spacing: -0.02em;
          -webkit-text-fill-color: var(--li-text-muted);
          background: none;
        }

        .tagline-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; background: white; border: 1px solid var(--li-border);
          border-radius: 20px; font-size: 13px; font-weight: 600; color: var(--li-text-muted);
          margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .dot {
          width: 8px; height: 8px; background: #10B981;
          border-radius: 50%; animation: pulse 2s infinite;
        }

        .hero-social-row { display: flex; gap: 10px; margin: 16px 0; flex-wrap: wrap; }

        .buttons { display: flex; gap: 14px; margin-top: 8px; flex-wrap: wrap; }

        /* Hero stats */
        .hero-stats {
          display: flex; gap: 32px; margin-top: 36px; flex-wrap: wrap;
        }
        .hero-stat { display: flex; flex-direction: column; gap: 2px; }
        .hero-stat-num {
          font-size: 32px; font-weight: 900; letter-spacing: -0.04em;
          line-height: 1;
        }
        .hero-stat-lbl {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          font-weight: 700; color: var(--li-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* ── 3D Hero visual ── */
        .hero-visual {
          flex: 1; display: flex; justify-content: center; align-items: center;
          position: relative; min-height: 480px;
        }
        .hero-3d-scene {
          position: relative; width: 380px; height: 440px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Profile 3D card */
        .profile-3d-card {
          position: relative; z-index: 2;
          background: white; border-radius: 24px;
          border: 1px solid var(--li-border);
          box-shadow: 0 32px 80px rgba(62,24,249,0.12), 0 8px 24px rgba(0,0,0,0.06);
          overflow: hidden; width: 280px;
          transform-style: preserve-3d;
        }
        .profile-card-glow {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(62,24,249,0.06), rgba(55,215,250,0.06));
          pointer-events: none;
        }
        .profile-card-photo {
          width: 100%; height: 220px; object-fit: cover; display: block;
        }
        .profile-card-placeholder {
          width: 100%; height: 220px;
          background: linear-gradient(135deg, rgba(62,24,249,0.10), rgba(55,215,250,0.10));
          display: flex; align-items: center; justify-content: center;
          font-size: 80px; font-weight: 900;
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          color: var(--li-purple);
        }
        .profile-card-info { padding: 18px 20px; }
        .profile-card-name  { font-size: 18px; font-weight: 900; margin: 0 0 4px; letter-spacing: -0.02em; }
        .profile-card-title { font-size: 12px; color: var(--li-text-muted); margin: 0 0 6px; font-weight: 600; }
        .profile-card-loc   { font-size: 12px; color: var(--li-text-muted); margin: 0; }

        /* Floating badges */
        .float-badge {
          position: absolute; background: white;
          border: 1px solid var(--li-border);
          border-radius: 999px; font-size: 12px; font-weight: 800;
          padding: 8px 14px; white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 3; font-family: 'IBM Plex Mono', monospace;
          animation: badgeFloat 4s ease-in-out infinite;
        }
        .float-badge-1 { top: -16px; right: -24px; animation-delay: 0s; }
        .float-badge-2 { bottom: 40px; left: -28px; animation-delay: 1.2s; }
        .float-badge-3 { bottom: -16px; right: -20px; animation-delay: 2.4s; }

        /* ── About ── */
        .about-grid {
          display: grid; grid-template-columns: 1fr 1.6fr; gap: 60px;
          max-width: 1100px; width: 100%; align-items: start;
        }
        .about-photo-wrap {
          position: relative; border-radius: 20px; overflow: hidden;
          box-shadow: 0 24px 60px rgba(62,24,249,0.12);
        }
        .about-photo { width: 100%; display: block; border-radius: 20px; }
        .about-photo-badge {
          position: absolute; bottom: 20px; right: 20px;
          background: white; border-radius: 12px;
          padding: 12px 16px; text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          font-weight: 800; font-size: 12px; color: var(--li-text-muted);
        }
        .about-photo-num {
          display: block; font-size: 28px; font-weight: 900;
          background: linear-gradient(90deg, var(--li-purple), var(--li-cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.1;
        }
        .about-objective {
          font-size: 18px; font-weight: 600; color: var(--li-text-main);
          line-height: 1.6; margin: 0 0 16px; border-left: 3px solid var(--li-purple);
          padding-left: 16px;
        }
        .about-bio { font-size: 16px; color: var(--li-text-muted); line-height: 1.7; margin: 0 0 24px; }
        .about-details { display: flex; flex-direction: column; gap: 12px; margin: 0 0 24px; }
        .about-detail-item { display: flex; align-items: flex-start; gap: 10px; }
        .about-detail-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .about-detail-lbl  { display: block; font-size: 11px; font-weight: 700; color: var(--li-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace; }
        .about-detail-val  { display: block; font-size: 14px; font-weight: 600; color: var(--li-text-main); }
        .about-detail-link { text-decoration: none; color: var(--li-purple); }
        .about-detail-link:hover { text-decoration: underline; }
        .about-skills-summary {
          font-size: 14px; color: var(--li-text-muted); line-height: 1.65;
          margin: 0 0 20px; padding: 14px 16px; border-radius: 8px;
          background: rgba(62,24,249,0.04); border: 1px solid rgba(62,24,249,0.12);
        }
        .about-socials { display: flex; flex-wrap: wrap; gap: 10px; }
        .social-pill {
          padding: 8px 16px; border-radius: 6px; border: 1px solid var(--li-border);
          background: white; font-size: 13px; font-weight: 700; color: var(--li-text-muted);
          text-decoration: none; transition: all 0.18s ease; font-family: 'IBM Plex Mono', monospace;
        }
        .social-pill:hover {
          background: var(--li-purple); color: white; border-color: var(--li-purple);
          transform: translateY(-2px);
        }

        /* ── Skills ── */
        .skill-category-block { margin-bottom: 36px; width: 100%; }
        .skill-cat-title {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 800;
          color: var(--li-purple); text-transform: uppercase; letter-spacing: 0.10em;
          margin: 0 0 16px; padding-bottom: 8px;
          border-bottom: 1px solid rgba(62,24,249,0.15);
        }
        .skills-grid {
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .skill-badge {
          font-family: 'IBM Plex Mono', monospace;
          background: white; color: var(--li-text-main);
          padding: 14px 22px; border-radius: 6px; font-weight: 600; font-size: 14px;
          border: 1px solid var(--li-border);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }
        .skill-badge:hover {
          transform: translateY(-3px); border-color: var(--li-cyan);
          color: var(--li-purple); box-shadow: 0 8px 20px rgba(55,215,250,0.12);
        }
        /* 3D skill badge */
        .skill-badge-3d { cursor: default; }
        .skill-badge-inner {
          display: flex; align-items: center; gap: 10px;
          background: white; border-radius: 10px; border: 1px solid;
          padding: 10px 16px; min-width: 120px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .skill-badge-inner::after {
          content:""; position:absolute; top:-40%; left:-40%; width:50%; height:180%;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          transform:skewX(-15deg);
          animation: shimmer 3s ease-in-out infinite;
        }
        .skill-icon-img {
          width: 24px; height: 24px; object-fit: contain; flex-shrink: 0;
        }
        .skill-icon-letter {
          width: 24px; height: 24px; flex-shrink: 0;
          font-size: 16px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
        }
        .skill-badge-name { font-size: 13px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
        .skill-badge-bar-wrap {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: rgba(0,0,0,0.05);
        }
        .skill-badge-bar { height: 100%; border-radius: 0 0 10px 10px; }

        /* ── Projects ── */
        .project-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .project-card-3d {
          background: var(--li-card-bg); border-radius: 14px;
          border: 1px solid var(--li-border);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          overflow: hidden; display: flex; flex-direction: column;
          cursor: default;
        }
        .project-card-3d:hover { box-shadow: 0 20px 48px rgba(62,24,249,0.10); }
        .proj-thumb {
          height: 180px; overflow: hidden; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(62,24,249,0.06), rgba(55,215,250,0.06));
        }
        .proj-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .project-card-3d:hover .proj-thumb img { transform: scale(1.04); }
        .proj-thumb-placeholder {
          display: flex; align-items: center; justify-content: center; font-size: 40px;
        }
        .proj-body { padding: 20px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .proj-complexity {
          display: inline-block; font-family: 'IBM Plex Mono', monospace;
          font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px;
          text-transform: uppercase; letter-spacing: 0.05em; align-self: flex-start;
        }
        .proj-cx-1 { background:rgba(148,163,184,0.12); color:#64748b; }
        .proj-cx-2 { background:rgba(245,158,11,0.12);  color:#b45309; }
        .proj-cx-3 { background:rgba(62,24,249,0.10);   color:var(--li-purple); }
        .proj-title { font-size: 17px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .proj-desc  { font-size: 13px; color: var(--li-text-muted); margin: 0; line-height: 1.55;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .proj-tech-row { display: flex; flex-wrap: wrap; gap: 5px; }
        .proj-tech-chip {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
          padding: 3px 8px; border-radius: 4px;
          background: rgba(15,23,42,0.04); border: 1px solid var(--li-border); color: var(--li-text-muted);
        }
        .proj-tags  { display: flex; flex-wrap: wrap; gap: 5px; }
        .proj-tag   {
          font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
          background: rgba(62,24,249,0.07); color: var(--li-purple);
          border: 1px solid rgba(62,24,249,0.15); font-family: 'IBM Plex Mono', monospace;
        }
        .proj-links { display: flex; gap: 8px; margin-top: auto; padding-top: 4px; }
        .proj-link  {
          display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px;
          border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none;
          transition: all 0.18s ease; border: 1px solid;
        }
        .proj-link-gh   { color: var(--li-text-muted); border-color: var(--li-border); background: transparent; }
        .proj-link-gh:hover { color: var(--li-text-main); border-color: var(--li-text-main); transform: translateY(-1px); }
        .proj-link-live { color: var(--li-purple); border-color: rgba(62,24,249,0.25); background: rgba(62,24,249,0.05); }
        .proj-link-live:hover { background: rgba(62,24,249,0.12); transform: translateY(-1px); }

        /* ── Certificates ── */
        .certs-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .cert-card {
          background: white; border-radius: 14px; border: 1px solid var(--li-border);
          padding: 24px; display: flex; flex-direction: column; gap: 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.04);
          cursor: default; transition: box-shadow 0.2s;
        }
        .cert-card:hover { box-shadow: 0 16px 40px rgba(62,24,249,0.10); }
        .cert-card-top { display: flex; align-items: center; gap: 14px; }
        .cert-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 10px; border: 1px solid var(--li-border); }
        .cert-logo-placeholder {
          width: 52px; height: 52px; border-radius: 10px; border: 1px solid var(--li-border);
          background: rgba(62,24,249,0.06); display: flex; align-items: center;
          justify-content: center; font-size: 24px; flex-shrink: 0;
        }
        .cert-card-info { flex: 1; min-width: 0; }
        .cert-name { font-size: 15px; font-weight: 800; margin: 0 0 4px; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cert-org  { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700;
          color: var(--li-purple); margin: 0; }
        .cert-desc { font-size: 13px; color: var(--li-text-muted); line-height: 1.55; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cert-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
        .cert-date { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; color: var(--li-text-muted); }
        .cert-verify-btn {
          font-size: 12px; font-weight: 800; color: var(--li-purple);
          text-decoration: none; padding: 5px 12px; border-radius: 6px;
          border: 1px solid rgba(62,24,249,0.25); background: rgba(62,24,249,0.06);
          transition: all 0.18s; font-family: 'IBM Plex Mono', monospace;
        }
        .cert-verify-btn:hover { background: rgba(62,24,249,0.14); transform: translateY(-1px); }

        /* ── Contact ── */
        .contact-card {
          max-width: 900px; width: 100%; cursor: default;
        }
        .contact-card-inner {
          background: white; border-radius: 20px; border: 1px solid var(--li-border);
          box-shadow: 0 24px 60px rgba(62,24,249,0.08);
          padding: 48px; display: flex; gap: 48px; flex-wrap: wrap;
          position: relative; overflow: hidden;
        }
        .contact-card-inner::before {
          content:""; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--li-purple), var(--li-cyan), var(--li-pink));
          background-size:200% 100%; animation: gradientShift 3s ease infinite;
        }
        .contact-left  { flex: 1; min-width: 220px; }
        .contact-right { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
        .contact-left h3 { font-size: 22px; font-weight: 900; margin: 0 0 12px; letter-spacing: -0.02em; }
        .contact-left p  { color: var(--li-text-muted); font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
        .contact-links { display: flex; flex-direction: column; gap: 12px; }
        .contact-link {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; font-weight: 600; color: var(--li-text-muted);
          text-decoration: none; transition: color 0.18s;
        }
        .contact-link:hover { color: var(--li-text-main); }
        .contact-link-icon { font-size: 16px; flex-shrink: 0; }
        .contact-social-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 8px;
          border: 1px solid var(--li-border); background: var(--li-bg);
          font-size: 14px; font-weight: 700; color: var(--li-text-muted);
          text-decoration: none; transition: all 0.18s ease; width: 100%;
        }
        .contact-social-btn:hover {
          border-color: var(--li-purple); color: var(--li-purple);
          background: rgba(62,24,249,0.04); transform: translateX(4px);
        }
        .contact-social-ig:hover { color: #c026d3; border-color: #c026d3; background: rgba(192,38,211,0.04); }

        /* ── Mobile nav ── */
        .mobile-bottom-nav { display: none; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .about-left { max-width: 400px; margin: 0 auto; }
        }
        @media (max-width: 900px) {
          .hero-content { flex-direction: column; text-align: center; gap: 48px; }
          .hero-text { align-items: center; max-width: 100%; }
          .hero-social-row, .buttons, .hero-stats { justify-content: center; }
          .hero-visual { min-height: 380px; }
          .hero-3d-scene { width: 320px; height: 380px; }
          .profile-3d-card { width: 240px; }
          .profile-card-photo { height: 190px; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .nav-container { justify-content: center; }
          .page-content { padding-bottom: 80px; }
          .mobile-bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
            border-top: 1px solid var(--li-border);
            padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
            justify-content: space-between; align-items: center;
            z-index: 1000; box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          }
          .mobile-nav-item {
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            color: var(--li-text-muted); text-decoration: none;
            font-size: 10px; font-weight: 700; transition: color 0.18s;
          }
          .mobile-nav-item:hover, .mobile-nav-active { color: var(--li-purple); }
          .admin-mobile { color: var(--li-purple); font-family: 'IBM Plex Mono', monospace; }
          .section { padding: 80px 5%; }
          .contact-card-inner { padding: 28px 24px; }
          .float-badge { display: none; }
        }
        @media (max-width: 480px) {
          .hero { padding-top: 100px; }
          .hero h1 { font-size: 38px; }
          .hero-visual { display: none; }
          .project-grid { grid-template-columns: 1fr; }
          .certs-grid   { grid-template-columns: 1fr; }
          .glow-cyan    { width: 300px; height: 300px; }
          .glow-purple  { width: 250px; height: 250px; }
          .glow-pink    { width: 250px; height: 250px; }
        }
      `}</style>
    </>
  );
};

export default Home;