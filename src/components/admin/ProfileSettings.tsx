import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  User, MapPin, Phone, FileText, Image as ImageIcon,
  Edit3, Save, X, CheckCircle, Camera,
  Briefcase, Globe, Github, Twitter, Linkedin, Star, Code2, Mail
} from "lucide-react";

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePhotoMutation,
  useUploadResumeMutation,
  useUploadCoverImageMutation,
} from "../../redux/services/profileApi";
import type { ProfileUpdateRequest } from "../../redux/services/profileApi";

const ProfileSettings = () => {
  /* ─── API Hooks ─── */
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
  const [uploadResume, { isLoading: isUploadingResume }] = useUploadResumeMutation();
  const [uploadCover, { isLoading: isUploadingCover }] = useUploadCoverImageMutation();

  /* ─── Edit State ─── */
  const [editSections, setEditSections] = useState({
    basic: false,
    professional: false,
    social: false,
    media: false,
  });

  /* ─── Form State ─── */
  const [form, setForm] = useState<ProfileUpdateRequest>({
    full_name: "",
    title: "",
    objective: "",
    bio: "",
    experience_years: 0,
    skills_summary: "",
    phone: "",
    location: "",
    social_links: {
      linkedin: "",
      github: "",
      twitter: "",
      instagram: "",
      website: "",
    },
  });

  /* ─── Sync profile → form ─── */
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        title: profile.title ?? "",
        objective: profile.objective ?? "",
        bio: profile.bio ?? "",
        experience_years: profile.experience_years ?? 0,
        skills_summary: profile.skills_summary ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        social_links: {
          linkedin: profile.social_links?.linkedin ?? "",
          github: profile.social_links?.github ?? "",
          twitter: profile.social_links?.twitter ?? "",
          instagram: profile.social_links?.instagram ?? "",
          website: profile.social_links?.website ?? "",
        },
      });
    }
  }, [profile]);

  /* ─── Handlers ─── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [e.target.name]: e.target.value },
    }));
  };

  const toggleEdit = (section: keyof typeof editSections) => {
    setEditSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Strip empty strings so backend doesn't get empty optional fields
  const clean = (val: string | undefined) => (val?.trim() === "" ? undefined : val?.trim());

  const getSectionPayload = (section: keyof typeof editSections): ProfileUpdateRequest => {
    switch (section) {
      case "basic":
        return {
          full_name: clean(form.full_name),
          title: clean(form.title),
          phone: clean(form.phone),
          location: clean(form.location),
        };
      case "social":
        return {
          social_links: {
            github:    clean(form.social_links?.github),
            linkedin:  clean(form.social_links?.linkedin),
            twitter:   clean(form.social_links?.twitter),
            website:   clean(form.social_links?.website),
            instagram: clean(form.social_links?.instagram),
          },
        };
      case "professional":
        return {
          objective:        clean(form.objective),
          bio:              clean(form.bio),
          experience_years: Number(form.experience_years),
          skills_summary:   clean(form.skills_summary),
        };
      default:
        return {};
    }
  };

  const handleSave = async (section: keyof typeof editSections) => {
    if (!profile?.user_id) return;
    try {
      const payload = getSectionPayload(section);
      await updateProfile({
        userId: profile.user_id,
        body: payload,
      }).unwrap();
      toast.success("Profile updated!");
      toggleEdit(section);
      refetch();
    } catch (err: any) {
      const detail = err?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join(", ")
        : detail ?? "Update failed.";
      toast.error(msg);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "resume" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.user_id) return;
    e.target.value = ""; // reset so same file can be re-selected
    try {
      if (type === "photo")  await uploadPhoto({ userId: profile.user_id, file }).unwrap();
      if (type === "resume") await uploadResume({ userId: profile.user_id, file }).unwrap();
      if (type === "cover")  await uploadCover({ userId: profile.user_id, file }).unwrap();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
      refetch();
    } catch {
      toast.error(`Failed to upload ${type}.`);
    }
  };

  /* ─── Cursor Aurora Effect ─── */
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".hover-aurora-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="ps-loading">
        <div className="ps-loading-spinner" />
        <span>Loading profile…</span>
      </div>
    );
  }

  const hasGithub = !!profile?.social_links?.github?.trim();
  const avatarLetter = (profile?.full_name || "U").charAt(0).toUpperCase();

  return (
    <div className="ps-wrapper">

      {/* ── Page Header ── */}
      <div className="ps-page-header anim-fade-down">
        <h2>Manage <span className="ps-gradient-text">Profile</span></h2>
        <p className="ps-subtitle">Control how your portfolio is presented.</p>
      </div>

      {/* ══════════════ HERO CARD ══════════════ */}
      <div className="ps-card ps-hero hover-aurora-card anim-fade-up" style={{ animationDelay: "0.05s" }}>
        <div className="ps-hero-border-top" />
        <div className="ps-hero-body">
          {/* Avatar */}
          <div className="ps-avatar-wrap">
            <div className="ps-avatar">
              {profile?.profile_photo
                ? <img src={profile.profile_photo} alt="Avatar" />
                : <div className="ps-avatar-letter">{avatarLetter}</div>
              }
              <label className="ps-avatar-overlay" aria-label="Upload photo">
                {isUploadingPhoto
                  ? <div className="ps-spinner-sm" />
                  : <Camera size={16} color="#fff" />
                }
                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "photo")} />
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="ps-hero-info">
            <h2 className="ps-hero-name">{profile?.full_name || "Your Profile"}</h2>
            <p className="ps-hero-title">{profile?.title || "Update your title"}</p>
            <div className="ps-chips">
              {hasGithub
                ? <span className="ps-chip ps-chip-success"><CheckCircle size={12} />GitHub Linked</span>
                : <span className="ps-chip ps-chip-warn">Link GitHub</span>
              }
              {profile?.email && <span className="ps-chip ps-chip-default"><Mail size={12} />Email Added</span>}
              {profile?.phone && <span className="ps-chip ps-chip-default"><Phone size={12} />Phone Added</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ GRID ══════════════ */}
      <div className="ps-grid">

        {/* ── Personal Details ── */}
        <div className="ps-card hover-aurora-card anim-fade-up" style={{ animationDelay: "0.12s" }}>
          <div className="ps-card-header">
            <h3 className="ps-section-title">Personal Details</h3>
            {!editSections.basic ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("basic")}><Edit3 size={14} />Edit</button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("basic")}><X size={16} /></button>
                <button className="ps-btn-save" onClick={() => handleSave("basic")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <Save size={16} />}
                </button>
              </div>
            )}
          </div>

          {!editSections.basic ? (
            <div className="ps-info-list">
              {[
                { icon: <User size={15} />,     label: "Full Name", value: profile?.full_name },
                { icon: <Briefcase size={15} />,label: "Title",     value: profile?.title },
                { icon: <Phone size={15} />,    label: "Phone",     value: profile?.phone },
                { icon: <MapPin size={15} />,   label: "Location",  value: profile?.location },
              ].map(({ icon, label, value }) => (
                <div className="ps-info-item" key={label}>
                  <span className="ps-info-label">{icon}{label}</span>
                  <span className="ps-info-value">{value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ps-form anim-expand-in">
              <div className="ps-field"><label>Full Name</label><input name="full_name" value={form.full_name} onChange={handleChange} /></div>
              <div className="ps-field"><label>Professional Title</label><input name="title" value={form.title} onChange={handleChange} /></div>
              <div className="ps-field"><label>Phone Number</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
              <div className="ps-field"><label>Location (City, Country)</label><input name="location" value={form.location} onChange={handleChange} /></div>
            </div>
          )}
        </div>

        {/* ── Social Profiles ── */}
        <div className="ps-card hover-aurora-card anim-fade-up" style={{ animationDelay: "0.18s" }}>
          <div className="ps-card-header">
            <h3 className="ps-section-title">Social Profiles</h3>
            {!editSections.social ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("social")}><Edit3 size={14} />Edit</button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("social")}><X size={16} /></button>
                <button className="ps-btn-save" onClick={() => handleSave("social")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <Save size={16} />}
                </button>
              </div>
            )}
          </div>

          {!editSections.social ? (
            <div className="ps-info-list">
              {[
                { icon: <Github size={15} />,   label: "GitHub",      value: profile?.social_links?.github },
                { icon: <Linkedin size={15} />, label: "LinkedIn",    value: profile?.social_links?.linkedin },
                { icon: <Twitter size={15} />,  label: "Twitter / X", value: profile?.social_links?.twitter },
                { icon: <Globe size={15} />,    label: "Website",     value: profile?.social_links?.website },
              ].map(({ icon, label, value }) => (
                <div className="ps-info-item" key={label}>
                  <span className="ps-info-label">{icon}{label}</span>
                  <span className="ps-info-value ps-break">{value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ps-form anim-expand-in">
              <div className="ps-field"><label>GitHub Username / URL</label><input name="github" value={form.social_links?.github ?? ""} onChange={handleSocialChange} /></div>
              <div className="ps-field"><label>LinkedIn URL</label><input name="linkedin" value={form.social_links?.linkedin ?? ""} onChange={handleSocialChange} /></div>
              <div className="ps-field"><label>Twitter / X URL</label><input name="twitter" value={form.social_links?.twitter ?? ""} onChange={handleSocialChange} /></div>
              <div className="ps-field"><label>Portfolio Website</label><input name="website" value={form.social_links?.website ?? ""} onChange={handleSocialChange} /></div>
            </div>
          )}
        </div>

        {/* ── Professional Summary ── */}
        <div className="ps-card ps-full hover-aurora-card anim-fade-up" style={{ animationDelay: "0.24s" }}>
          <div className="ps-card-header">
            <h3 className="ps-section-title">Professional Summary</h3>
            {!editSections.professional ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("professional")}><Edit3 size={14} />Edit</button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("professional")}><X size={16} /></button>
                <button className="ps-btn-save" onClick={() => handleSave("professional")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <Save size={16} />}
                </button>
              </div>
            )}
          </div>

          {!editSections.professional ? (
            <div className="ps-summary-body">
              <p className="ps-bio"><strong>Objective:</strong> {profile?.objective || "No objective set."}</p>
              <p className="ps-bio ps-mt"><strong>Bio:</strong> {profile?.bio || "No bio added yet."}</p>
              <div className="ps-divider" />
              <div className="ps-exp-row">
                <span className="ps-info-label"><Star size={14} />Experience:</span>
                <span className="ps-info-value">{profile?.experience_years ?? 0} Years</span>
              </div>
              <p className="ps-info-label ps-mb-sm"><Code2 size={14} />Tech Stack:</p>
              <div className="ps-skills">
                {profile?.skills_summary
                  ? profile.skills_summary.split(",").map((s, i) => (
                      <span key={i} className="ps-skill" style={{ animationDelay: `${i * 0.04}s` }}>{s.trim()}</span>
                    ))
                  : <span className="ps-bio">No skills added.</span>
                }
              </div>
            </div>
          ) : (
            <div className="ps-form anim-expand-in">
              <div className="ps-field"><label>Career Objective</label><textarea name="objective" value={form.objective} onChange={handleChange} rows={2} /></div>
              <div className="ps-field"><label>Full Bio</label><textarea name="bio" value={form.bio} onChange={handleChange} rows={4} /></div>
              <div className="ps-form-2col">
                <div className="ps-field"><label>Years of Experience</label><input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} /></div>
                <div className="ps-field"><label>Skills (comma separated)</label><input name="skills_summary" value={form.skills_summary} onChange={handleChange} /></div>
              </div>
            </div>
          )}
        </div>

        {/* ── Media & Assets ── */}
        <div className="ps-card ps-full hover-aurora-card anim-fade-up" style={{ animationDelay: "0.30s" }}>
          <div className="ps-card-header">
            <h3 className="ps-section-title">Media &amp; Assets</h3>
          </div>
          <div className="ps-uploads">

            <div className="ps-upload-card ps-upload-shimmer">
              <div className="ps-upload-icon"><FileText size={22} /></div>
              <div className="ps-upload-info">
                <h4>Resume / CV</h4>
                <p>{profile?.resume_url ? "Resume uploaded ✓" : "Upload your latest PDF"}</p>
              </div>
              <label className="ps-btn-outline ps-upload-label">
                {isUploadingResume ? <><div className="ps-spinner-sm" />Uploading…</> : "Replace File"}
                <input type="file" hidden accept=".pdf" onChange={(e) => handleUpload(e, "resume")} />
              </label>
            </div>

            <div className="ps-upload-card ps-upload-shimmer">
              <div className="ps-upload-icon"><ImageIcon size={22} /></div>
              <div className="ps-upload-info">
                <h4>Cover Image</h4>
                <p>{profile?.cover_image ? "Cover uploaded ✓" : "Upload hero background"}</p>
              </div>
              <label className="ps-btn-outline ps-upload-label">
                {isUploadingCover ? <><div className="ps-spinner-sm" />Uploading…</> : "Replace File"}
                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "cover")} />
              </label>
            </div>

          </div>
        </div>

      </div>{/* /ps-grid */}

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;600;800;900&display=swap');

        /* ── Variables ── */
        :root {
          --ps-bg:         #F7F8FC;
          --ps-card:       #FFFFFF;
          --ps-border:     rgba(15,23,42,0.10);
          --ps-text:       #0F172A;
          --ps-muted:      rgba(15,23,42,0.55);
          --ps-purple:     #6D28D9;
          --ps-cyan:       #22D3EE;
          --ps-orange:     #FF8A3D;
          --ps-green-bg:   rgba(46,125,50,0.12);
          --ps-green-text: #1B5E20;
          --ps-red-bg:     rgba(211,47,47,0.12);
          --ps-red-text:   #C62828;
        }

        /* ── Keyframes ── */
        @keyframes ps-fadeDown  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ps-fadeUp    { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes ps-expandIn  { from{opacity:0;transform:scaleY(0.90)} to{opacity:1;transform:scaleY(1)} }
        @keyframes ps-chipPop   { 0%{opacity:0;transform:scale(0.7)} 70%{transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ps-skillIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ps-shimmer   { 0%{left:-80%} 100%{left:120%} }
        @keyframes ps-pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(109,40,217,0.22)} 50%{box-shadow:0 0 0 8px rgba(109,40,217,0)} }
        @keyframes ps-spin      { to{transform:rotate(360deg)} }
        @keyframes ps-glow      { 0%,100%{opacity:0.7} 50%{opacity:1} }

        /* ── Animation classes ── */
        .anim-fade-down { animation: ps-fadeDown 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-fade-up   { opacity:0; animation: ps-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .anim-expand-in { transform-origin:top; animation: ps-expandIn 0.25s cubic-bezier(.22,1,.36,1) both; }

        /* ── Wrapper ── */
        .ps-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 48px;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          color: var(--ps-text);
          background: radial-gradient(60% 70% at 20% 25%, rgba(255,138,61,0.08) 0%, transparent 60%), var(--ps-bg);
        }

        /* ── Page Header ── */
        .ps-page-header { margin-bottom: 24px; }
        .ps-page-header h2 { font-size: clamp(22px, 5vw, 32px); font-weight: 900; letter-spacing: -0.03em; margin: 0 0 4px; }
        .ps-gradient-text {
          background: linear-gradient(90deg, var(--ps-orange) 0%, var(--ps-purple) 55%, var(--ps-cyan) 110%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .ps-subtitle { color: var(--ps-muted); font-size: 14px; margin: 0; }

        /* ── Base card ── */
        .ps-card {
          background: rgba(255,255,255,0.94);
          border-radius: 14px;
          border: 1px solid var(--ps-border);
          padding: 24px;
          box-shadow: 0 16px 40px rgba(2,6,23,0.06);
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .ps-card:hover { transform: translateY(-2px); box-shadow: 0 22px 50px rgba(2,6,23,0.10); }

        /* Aurora cursor */
        .hover-aurora-card::before {
          content:""; position:absolute; inset:0; border-radius:inherit; padding:2px;
          background: radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(109,40,217,0.16), transparent 40%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events:none; z-index:1;
        }
        .hover-aurora-card::after {
          content:""; position:absolute; inset:0;
          background: radial-gradient(800px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(34,211,238,0.04), transparent 40%);
          pointer-events:none; z-index:0;
        }

        /* ── Hero card ── */
        .ps-hero {
          margin-bottom: 20px;
          padding: 28px 24px;
          background: radial-gradient(60% 80% at 10% 20%, rgba(255,138,61,0.07) 0%, transparent 60%), #fff;
        }
        .ps-hero-border-top {
          position:absolute; top:0; left:0; right:0; height:4px;
          background: linear-gradient(90deg, var(--ps-orange) 0%, var(--ps-purple) 55%, var(--ps-cyan) 110%);
          animation: ps-glow 3s ease-in-out infinite;
        }
        .ps-hero-body {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 20px;
          position: relative;
          z-index: 1;
        }

        /* Avatar */
        .ps-avatar-wrap { flex-shrink: 0; }
        .ps-avatar {
          width: 84px; height: 84px; border-radius: 12px;
          border: 1px solid var(--ps-border); overflow: hidden;
          position: relative;
          animation: ps-pulse 3s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .ps-avatar:hover { transform: scale(1.05); animation-play-state: paused; }
        .ps-avatar img { width:100%; height:100%; object-fit:cover; display:block; }
        .ps-avatar-letter {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
          font-size:34px; font-weight:900; color:var(--ps-purple); background:rgba(109,40,217,0.1);
        }
        .ps-avatar-overlay {
          position:absolute; inset:0; background:rgba(0,0,0,0.5);
          display:flex; align-items:center; justify-content:center;
          opacity:0; cursor:pointer; transition:opacity 0.2s;
        }
        .ps-avatar:hover .ps-avatar-overlay { opacity:1; }

        /* Hero info */
        .ps-hero-info { flex:1; min-width:0; }
        .ps-hero-name {
          font-size: clamp(20px, 4vw, 30px);
          font-weight: 950; margin: 0 0 4px;
          letter-spacing: -0.02em;
          word-break: break-word;
        }
        .ps-hero-title { font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--ps-muted); margin:0 0 14px; }
        .ps-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .ps-chip {
          font-size:12px; font-weight:700; padding:5px 10px; border-radius:6px;
          border:1px solid var(--ps-border); display:inline-flex; align-items:center; gap:5px;
          animation: ps-chipPop 0.35s cubic-bezier(.34,1.56,.64,1) both;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ps-chip:hover { transform:translateY(-1px); box-shadow:0 4px 10px rgba(0,0,0,0.08); }
        .ps-chip-success { background:var(--ps-green-bg); color:var(--ps-green-text); }
        .ps-chip-warn    { background:rgba(255,138,61,0.12); color:#b45309; }
        .ps-chip-default { background:rgba(255,255,255,0.9); color:var(--ps-text); }

        /* ── Grid layout ── */
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .ps-full { grid-column: 1 / -1; }

        /* ── Card header ── */
        .ps-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 16px; padding-bottom: 14px;
          border-bottom: 1px solid var(--ps-border);
          position: relative; z-index: 2;
          gap: 8px; flex-wrap: wrap;
        }
        .ps-section-title { font-size:17px; font-weight:900; margin:0; }

        /* ── Info list ── */
        .ps-info-list { display:flex; flex-direction:column; gap:10px; position:relative; z-index:2; }
        .ps-info-item {
          display:flex; flex-direction:column; gap:3px; padding:10px 12px;
          background:rgba(255,255,255,0.9); border-radius:10px;
          border:1px solid var(--ps-border);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .ps-info-item:hover { border-color:rgba(109,40,217,0.22); box-shadow:0 6px 20px rgba(109,40,217,0.06); transform:translateX(3px); }
        .ps-info-label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--ps-muted); display:flex; align-items:center; gap:6px;
          text-transform:uppercase; letter-spacing:0.05em; flex-wrap:wrap;
        }
        .ps-info-value { font-size:14px; font-weight:700; color:var(--ps-text); word-break:break-word; }
        .ps-break { word-break:break-all; }

        /* ── Summary / bio ── */
        .ps-summary-body { position:relative; z-index:2; }
        .ps-bio { font-size:14px; line-height:1.65; color:var(--ps-text); margin:0; }
        .ps-mt  { margin-top:12px; }
        .ps-divider { height:1px; background:var(--ps-border); margin:18px 0; }
        .ps-exp-row { display:flex; align-items:center; gap:14px; margin-bottom:10px; flex-wrap:wrap; }
        .ps-mb-sm { margin-bottom:8px; }
        .ps-skills { display:flex; flex-wrap:wrap; gap:8px; }
        .ps-skill {
          font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600;
          background:rgba(255,255,255,0.85); border:1px solid var(--ps-border);
          padding:5px 11px; border-radius:6px; color:var(--ps-text);
          animation: ps-skillIn 0.3s cubic-bezier(.22,1,.36,1) both;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
        }
        .ps-skill:hover { background:rgba(109,40,217,0.08); border-color:rgba(109,40,217,0.3); color:var(--ps-purple); transform:translateY(-2px); }

        /* ── Forms ── */
        .ps-form { display:flex; flex-direction:column; gap:14px; position:relative; z-index:2; }
        .ps-form-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .ps-field { display:flex; flex-direction:column; gap:5px; }
        .ps-field label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--ps-muted); text-transform:uppercase; letter-spacing:0.05em;
        }
        .ps-field input, .ps-field textarea {
          width:100%; padding:10px 14px; border-radius:10px;
          border:1px solid var(--ps-border); background:rgba(0,0,0,0.02);
          font-family:'Inter',sans-serif; font-size:14px; color:var(--ps-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .ps-field input:focus, .ps-field textarea:focus {
          outline:none; border-color:var(--ps-purple); background:#fff;
          box-shadow:0 0 0 3px rgba(109,40,217,0.14); transform:translateY(-1px);
        }
        .ps-field textarea { resize:vertical; }

        /* ── Uploads ── */
        .ps-uploads {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          position: relative;
          z-index: 2;
        }
        .ps-upload-card {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          padding: 20px; border-radius: 10px;
          border: 1px solid var(--ps-border);
          background: rgba(0,0,0,0.015);
          position: relative; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          box-sizing: border-box;
        }
        .ps-upload-card:hover { border-color:rgba(109,40,217,0.22); box-shadow:0 8px 22px rgba(109,40,217,0.07); transform:translateY(-2px); }
        .ps-upload-shimmer::before {
          content:""; position:absolute; top:0; left:-80%; width:50%; height:100%;
          background:linear-gradient(120deg, transparent 0%, rgba(109,40,217,0.05) 50%, transparent 100%);
          pointer-events:none;
        }
        .ps-upload-shimmer:hover::before { animation:ps-shimmer 0.65s ease forwards; }
        .ps-upload-icon {
          width:42px; height:42px; border-radius:8px; flex-shrink:0;
          background:rgba(109,40,217,0.10); border:1px solid rgba(109,40,217,0.15);
          display:flex; align-items:center; justify-content:center; color:var(--ps-purple);
          transition: background 0.2s, transform 0.2s;
        }
        .ps-upload-card:hover .ps-upload-icon { background:rgba(109,40,217,0.16); transform:scale(1.08); }
        .ps-upload-info { flex:1; min-width:120px; }
        .ps-upload-info h4 { font-size:14px; font-weight:800; margin:0 0 3px; }
        .ps-upload-info p  { font-size:12px; color:var(--ps-muted); margin:0; }

        /* ── Buttons ── */
        .ps-btn-edit {
          background:#000; color:#fff; border:none;
          padding:7px 14px; border-radius:999px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          transition:all 0.2s ease; box-shadow:0 3px 10px rgba(0,0,0,0.1);
          white-space:nowrap; flex-shrink:0;
        }
        .ps-btn-edit:hover { background:var(--ps-purple); transform:translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(109,40,217,0.28); }
        .ps-btn-edit:active { transform:scale(0.96); }

        .ps-btn-row { display:flex; gap:6px; }
        .ps-btn-save, .ps-btn-cancel {
          border:none; padding:6px 11px; border-radius:6px; cursor:pointer;
          display:inline-flex; align-items:center; transition:all 0.2s ease;
        }
        .ps-btn-save   { background:var(--ps-green-bg); color:var(--ps-green-text); }
        .ps-btn-cancel { background:var(--ps-red-bg); color:var(--ps-red-text); }
        .ps-btn-save:hover   { background:rgba(46,125,50,0.22); transform:scale(1.08); }
        .ps-btn-cancel:hover { background:rgba(211,47,47,0.22); transform:scale(1.08); }
        .ps-btn-save:disabled { opacity:0.6; cursor:not-allowed; }

        .ps-btn-outline {
          background:transparent; border:1px solid rgba(109,40,217,0.35);
          color:var(--ps-purple); padding:9px 16px; border-radius:999px;
          font-family:'Inter',sans-serif; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          transition:all 0.2s ease; white-space:nowrap; flex-shrink:0;
        }
        .ps-btn-outline:hover { background:rgba(109,40,217,0.08); border-color:rgba(109,40,217,0.6); transform:translateY(-1px); box-shadow:0 4px 12px rgba(109,40,217,0.14); }
        .ps-upload-label { margin-left:auto; }

        /* ── Spinners ── */
        .ps-spinner-sm {
          width:14px; height:14px; border:2px solid currentColor; border-top-color:transparent;
          border-radius:50%; animation:ps-spin 0.6s linear infinite; flex-shrink:0;
        }

        /* ── Loading ── */
        .ps-loading {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:100px 20px; gap:14px;
          color:var(--ps-muted); font-family:'IBM Plex Mono',monospace; font-size:14px;
        }
        .ps-loading-spinner {
          width:32px; height:32px;
          border:3px solid rgba(109,40,217,0.2); border-top-color:var(--ps-purple);
          border-radius:50%; animation:ps-spin 0.7s linear infinite;
        }

        /* ══════════════ RESPONSIVE ══════════════ */

        /* Tablet ≤ 900px */
        @media (max-width: 900px) {
          .ps-grid    { grid-template-columns: 1fr; }
          .ps-uploads { grid-template-columns: 1fr; }
        }

        /* Phablet ≤ 640px */
        @media (max-width: 640px) {
          .ps-wrapper  { padding: 0 12px 40px; }
          .ps-card     { padding: 18px 16px; }
          .ps-hero     { padding: 22px 16px; }
          .ps-hero-body { flex-direction: column; align-items: flex-start; }
          .ps-form-2col { grid-template-columns: 1fr; }
          .ps-upload-card { flex-direction: column; align-items: flex-start; }
          .ps-upload-label { margin-left: 0; width: 100%; justify-content: center; }
          .ps-grid    { gap: 14px; }
        }

        /* Mobile ≤ 420px */
        @media (max-width: 420px) {
          .ps-wrapper   { padding: 0 8px 32px; }
          .ps-card      { padding: 14px 12px; border-radius: 10px; }
          .ps-hero      { padding: 18px 12px; }
          .ps-section-title { font-size: 15px; }
          .ps-hero-name { font-size: 20px; }
          .ps-btn-edit  { padding: 6px 11px; font-size: 12px; }
          .ps-info-value { font-size: 13px; }
          .ps-chip      { font-size: 11px; padding: 4px 8px; }
          .ps-grid      { gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;