import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  User, MapPin, Phone, FileText, Image as ImageIcon,
  Edit3, Save, X, CheckCircle, Camera, Trash2, Plus,
  Briefcase, Globe, Github, Twitter, Linkedin, Star, Code2, Mail,
  Building2, GraduationCap, Calendar
} from "lucide-react";

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePhotoMutation,
  useUploadResumeMutation,
  useUploadCoverImageMutation,
} from "../../redux/services/profileApi";
import type { ProfileUpdateRequest } from "../../redux/services/profileApi";

import { 
  useGetExperiencesQuery, 
  useCreateExperienceMutation, 
  useUpdateExperienceMutation, 
  useDeleteExperienceMutation 
} from "../../redux/services/experienceApi";

import { 
  useGetEducationsQuery, 
  useCreateEducationMutation, 
  useUpdateEducationMutation, 
  useDeleteEducationMutation 
} from "../../redux/services/educationApi";

const ProfileSettings = () => {
  /* ─── API Hooks ─── */
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
  const [uploadResume, { isLoading: isUploadingResume }] = useUploadResumeMutation();
  const [uploadCover, { isLoading: isUploadingCover }] = useUploadCoverImageMutation();

  // Experience Hooks
  const { data: experiences, isLoading: experiencesLoading, refetch: refetchExp } = useGetExperiencesQuery({});
  const [createExp] = useCreateExperienceMutation();
  const [updateExp] = useUpdateExperienceMutation();
  const [deleteExp] = useDeleteExperienceMutation();

  // Education Hooks
  const { data: educations, isLoading: educationsLoading, refetch: refetchEdu } = useGetEducationsQuery({});
  const [createEdu] = useCreateEducationMutation();
  const [updateEdu] = useUpdateEducationMutation();
  const [deleteEdu] = useDeleteEducationMutation();

  /* ─── Edit State ─── */
  const [editSections, setEditSections] = useState({
    basic: false,
    professional: false,
    social: false,
  });

  /* ─── Sub-entity Forms State ─── */
  const [editingExpId, setEditingExpId] = useState<string | "new" | null>(null);
  const [expForm, setExpForm] = useState({ company: "", position: "", location: "", start_date: "", end_date: "", description: "" });

  const [editingEduId, setEditingEduId] = useState<string | "new" | null>(null);
  const [eduForm, setEduForm] = useState({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "" });

  /* ─── Main Form State ─── */
  const [form, setForm] = useState<ProfileUpdateRequest>({
    full_name: "", title: "", objective: "", bio: "", experience_years: 0, skills_summary: "", phone: "", location: "",
    social_links: { linkedin: "", github: "", twitter: "", instagram: "", website: "" },
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

  /* ─── Handlers: Profile ─── */
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

  const clean = (val: string | undefined) => (val?.trim() === "" ? undefined : val?.trim());

  const getSectionPayload = (section: keyof typeof editSections): ProfileUpdateRequest => {
    switch (section) {
      case "basic": return { full_name: clean(form.full_name), title: clean(form.title), phone: clean(form.phone), location: clean(form.location) };
      case "social": return { social_links: { github: clean(form.social_links?.github), linkedin: clean(form.social_links?.linkedin), twitter: clean(form.social_links?.twitter), website: clean(form.social_links?.website), instagram: clean(form.social_links?.instagram) } };
      case "professional": return { objective: clean(form.objective), bio: clean(form.bio), experience_years: Number(form.experience_years), skills_summary: clean(form.skills_summary) };
      default: return {};
    }
  };

  const handleSave = async (section: keyof typeof editSections) => {
    if (!profile?.user_id) return;
    try {
      const payload = getSectionPayload(section);
      await updateProfile({ userId: profile.user_id, body: payload }).unwrap();
      toast.success("Profile updated!");
      toggleEdit(section);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Update failed.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "photo" | "resume" | "cover") => {
    const file = e.target.files?.[0];
    if (!file || !profile?.user_id) return;
    e.target.value = "";
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

  /* ─── Handlers: Experience ─── */
  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setExpForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEditExp = (exp?: any) => {
    if (exp) {
      setEditingExpId(exp.experience_id);
      setExpForm({
        company: exp.company || "", position: exp.position || "", location: exp.location || "",
        start_date: exp.start_date || "", end_date: exp.end_date || "", description: exp.description || "",
      });
    } else {
      setEditingExpId("new");
      setExpForm({ company: "", position: "", location: "", start_date: "", end_date: "", description: "" });
    }
  };

  const saveExp = async () => {
    try {
      const payload = {
        company: expForm.company, position: expForm.position, start_date: expForm.start_date,
        location: clean(expForm.location), end_date: clean(expForm.end_date), description: clean(expForm.description)
      };
      if (editingExpId === "new") {
        await createExp(payload).unwrap();
        toast.success("Experience added!");
      } else if (editingExpId) {
        await updateExp({ experienceId: editingExpId, body: payload }).unwrap();
        toast.success("Experience updated!");
      }
      setEditingExpId(null);
      refetchExp();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to save experience.");
    }
  };

  const delExp = async (id: string) => {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await deleteExp(id).unwrap();
      toast.success("Experience deleted!");
      refetchExp();
    } catch {
      toast.error("Failed to delete experience.");
    }
  };

  /* ─── Handlers: Education ─── */
  const handleEduChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEduForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEditEdu = (edu?: any) => {
    if (edu) {
      setEditingEduId(edu.education_id);
      setEduForm({
        institution: edu.institution || "", degree: edu.degree || "", field_of_study: edu.field_of_study || "",
        start_date: edu.start_date || "", end_date: edu.end_date || "", grade: edu.grade || "", description: edu.description || "",
      });
    } else {
      setEditingEduId("new");
      setEduForm({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", grade: "", description: "" });
    }
  };

  const saveEdu = async () => {
    try {
      const payload = {
        institution: eduForm.institution, degree: eduForm.degree, start_date: eduForm.start_date,
        field_of_study: clean(eduForm.field_of_study), end_date: clean(eduForm.end_date),
        grade: clean(eduForm.grade), description: clean(eduForm.description)
      };
      if (editingEduId === "new") {
        await createEdu(payload).unwrap();
        toast.success("Education added!");
      } else if (editingEduId) {
        await updateEdu({ educationId: editingEduId, body: payload }).unwrap();
        toast.success("Education updated!");
      }
      setEditingEduId(null);
      refetchEdu();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to save education.");
    }
  };

  const delEdu = async (id: string) => {
    if (!window.confirm("Delete this education?")) return;
    try {
      await deleteEdu(id).unwrap();
      toast.success("Education deleted!");
      refetchEdu();
    } catch {
      toast.error("Failed to delete education.");
    }
  };

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

      <div className="ps-page-header">
        <h2>Profile <span className="ps-gradient-text">Settings</span></h2>
        <p className="ps-subtitle">Manage your professional portfolio information</p>
      </div>

      {/* ══════════════ HERO CARD ══════════════ */}
      <div className="ps-card ps-hero">
        <div className="ps-hero-body">
          <div className="ps-avatar-wrap">
            <div className="ps-avatar">
              {profile?.profile_photo
                ? <img src={profile.profile_photo} alt="Avatar" />
                : <div className="ps-avatar-letter">{avatarLetter}</div>
              }
              <label className="ps-avatar-overlay" aria-label="Upload photo">
                {isUploadingPhoto ? <div className="ps-spinner-sm" /> : <Camera size={18} color="#fff" />}
                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "photo")} />
              </label>
            </div>
          </div>
          <div className="ps-hero-info">
            <h2 className="ps-hero-name">{profile?.full_name || "Your Name"}</h2>
            <p className="ps-hero-title">{profile?.title || "Add your professional title"}</p>
            <div className="ps-chips">
              {hasGithub ? (
                <span className="ps-chip ps-chip-success">
                  <CheckCircle size={14} />GitHub Linked
                </span>
              ) : (
                <span className="ps-chip ps-chip-warn">Link GitHub</span>
              )}
              {profile?.email && (
                <span className="ps-chip ps-chip-info">
                  <Mail size={14} />{profile.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ GRID ══════════════ */}
      <div className="ps-grid">

        {/* ── Personal Details ── */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <User size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Personal Details</h3>
            </div>
            {!editSections.basic ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("basic")}>
                <Edit3 size={16} />Edit
              </button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("basic")}>
                  <X size={16} />Cancel
                </button>
                <button className="ps-btn-save" onClick={() => handleSave("basic")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <><Save size={16} />Save</>}
                </button>
              </div>
            )}
          </div>
          {!editSections.basic ? (
            <div className="ps-info-list">
              {[
                { icon: <User size={16} />, label: "Full Name", value: profile?.full_name },
                { icon: <Briefcase size={16} />, label: "Title", value: profile?.title },
                { icon: <Phone size={16} />, label: "Phone", value: profile?.phone },
                { icon: <MapPin size={16} />, label: "Location", value: profile?.location },
              ].map(({ icon, label, value }) => (
                <div className="ps-info-item" key={label}>
                  <span className="ps-info-label">{icon}{label}</span>
                  <span className="ps-info-value">{value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ps-form">
              <div className="ps-field">
                <label>Full Name</label>
                <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="ps-field">
                <label>Professional Title</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Full Stack Developer" />
              </div>
              <div className="ps-field">
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
              </div>
              <div className="ps-field">
                <label>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Pune, India" />
              </div>
            </div>
          )}
        </div>

        {/* ── Social Profiles ── */}
        <div className="ps-card">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <Globe size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Social Profiles</h3>
            </div>
            {!editSections.social ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("social")}>
                <Edit3 size={16} />Edit
              </button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("social")}>
                  <X size={16} />Cancel
                </button>
                <button className="ps-btn-save" onClick={() => handleSave("social")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <><Save size={16} />Save</>}
                </button>
              </div>
            )}
          </div>
          {!editSections.social ? (
            <div className="ps-info-list">
              {[
                { icon: <Github size={16} />, label: "GitHub", value: profile?.social_links?.github },
                { icon: <Linkedin size={16} />, label: "LinkedIn", value: profile?.social_links?.linkedin },
                { icon: <Twitter size={16} />, label: "Twitter", value: profile?.social_links?.twitter },
                { icon: <Globe size={16} />, label: "Website", value: profile?.social_links?.website },
              ].map(({ icon, label, value }) => (
                <div className="ps-info-item" key={label}>
                  <span className="ps-info-label">{icon}{label}</span>
                  <span className="ps-info-value ps-break">{value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ps-form">
              <div className="ps-field">
                <label>GitHub Username / URL</label>
                <input name="github" value={form.social_links?.github ?? ""} onChange={handleSocialChange} placeholder="username or github.com/username" />
              </div>
              <div className="ps-field">
                <label>LinkedIn URL</label>
                <input name="linkedin" value={form.social_links?.linkedin ?? ""} onChange={handleSocialChange} placeholder="linkedin.com/in/username" />
              </div>
              <div className="ps-field">
                <label>Twitter URL</label>
                <input name="twitter" value={form.social_links?.twitter ?? ""} onChange={handleSocialChange} placeholder="twitter.com/username" />
              </div>
              <div className="ps-field">
                <label>Portfolio Website</label>
                <input name="website" value={form.social_links?.website ?? ""} onChange={handleSocialChange} placeholder="https://yourwebsite.com" />
              </div>
            </div>
          )}
        </div>

        {/* ── Professional Summary ── */}
        <div className="ps-card ps-full">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <Briefcase size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Professional Summary</h3>
            </div>
            {!editSections.professional ? (
              <button className="ps-btn-edit" onClick={() => toggleEdit("professional")}>
                <Edit3 size={16} />Edit
              </button>
            ) : (
              <div className="ps-btn-row">
                <button className="ps-btn-cancel" onClick={() => toggleEdit("professional")}>
                  <X size={16} />Cancel
                </button>
                <button className="ps-btn-save" onClick={() => handleSave("professional")} disabled={isUpdating}>
                  {isUpdating ? <div className="ps-spinner-sm" /> : <><Save size={16} />Save</>}
                </button>
              </div>
            )}
          </div>
          {!editSections.professional ? (
            <div className="ps-summary-body">
              <div className="ps-summary-section">
                <h4 className="ps-summary-label">Career Objective</h4>
                <p className="ps-bio">{profile?.objective || "No objective set yet."}</p>
              </div>
              <div className="ps-summary-section">
                <h4 className="ps-summary-label">About Me</h4>
                <p className="ps-bio">{profile?.bio || "No bio added yet."}</p>
              </div>
              <div className="ps-summary-meta">
                <div className="ps-meta-item">
                  <Star size={16} />
                  <span>{profile?.experience_years ?? 0} Years Experience</span>
                </div>
              </div>
              <div className="ps-summary-section">
                <h4 className="ps-summary-label"><Code2 size={16} />Skills & Technologies</h4>
                <div className="ps-skills">
                  {profile?.skills_summary
                    ? profile.skills_summary.split(",").map((s, i) => (
                        <span key={i} className="ps-skill">{s.trim()}</span>
                      ))
                    : <span className="ps-empty">No skills added yet.</span>
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="ps-form">
              <div className="ps-field">
                <label>Career Objective</label>
                <textarea name="objective" value={form.objective} onChange={handleChange} rows={3} placeholder="Describe your career goals and aspirations..." />
              </div>
              <div className="ps-field">
                <label>About Me</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={5} placeholder="Tell us about yourself, your experience, and what drives you..." />
              </div>
              <div className="ps-form-row">
                <div className="ps-field">
                  <label>Years of Experience</label>
                  <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} min="0" />
                </div>
                <div className="ps-field ps-field-grow">
                  <label>Skills (comma separated)</label>
                  <input name="skills_summary" value={form.skills_summary} onChange={handleChange} placeholder="React, Node.js, Python, AWS" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Experience Section ── */}
        <div className="ps-card ps-full">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <Building2 size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Work Experience</h3>
            </div>
            {editingExpId !== "new" && (
              <button className="ps-btn-add" onClick={() => startEditExp()}>
                <Plus size={16} />Add Experience
              </button>
            )}
          </div>
          
          {experiencesLoading ? (
            <div className="ps-loading-section">
              <div className="ps-spinner-sm" />
              <span>Loading experiences...</span>
            </div>
          ) : (
            <div className="ps-list">
              {/* Form for new Experience */}
              {editingExpId === "new" && (
                <div className="ps-form-card">
                  <div className="ps-form">
                    <div className="ps-form-row">
                      <div className="ps-field">
                        <label>Company Name *</label>
                        <input name="company" value={expForm.company} onChange={handleExpChange} placeholder="Google" />
                      </div>
                      <div className="ps-field">
                        <label>Position *</label>
                        <input name="position" value={expForm.position} onChange={handleExpChange} placeholder="Software Engineer" />
                      </div>
                    </div>
                    <div className="ps-form-row">
                      <div className="ps-field">
                        <label>Start Date *</label>
                        <input type="date" name="start_date" value={expForm.start_date} onChange={handleExpChange} />
                      </div>
                      <div className="ps-field">
                        <label>End Date</label>
                        <input type="date" name="end_date" value={expForm.end_date} onChange={handleExpChange} />
                      </div>
                    </div>
                    <div className="ps-field">
                      <label>Location</label>
                      <input name="location" value={expForm.location} onChange={handleExpChange} placeholder="Pune, India" />
                    </div>
                    <div className="ps-field">
                      <label>Description</label>
                      <textarea name="description" value={expForm.description} onChange={handleExpChange} rows={3} placeholder="Describe your role and achievements..." />
                    </div>
                    <div className="ps-btn-row ps-form-actions">
                      <button className="ps-btn-cancel" onClick={() => setEditingExpId(null)}>
                        <X size={16} />Cancel
                      </button>
                      <button className="ps-btn-save" onClick={saveExp}>
                        <Save size={16} />Save Experience
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Render Existing Experiences */}
              {experiences?.length === 0 && editingExpId !== "new" && (
                <div className="ps-empty-state">
                  <Building2 size={32} />
                  <p>No work experience added yet</p>
                  <span>Click "Add Experience" to get started</span>
                </div>
              )}
              
              {experiences?.map((exp) => (
                editingExpId === exp.experience_id ? (
                  // Inline Edit Form
                  <div className="ps-form-card" key={exp.experience_id}>
                    <div className="ps-form">
                      <div className="ps-form-row">
                        <div className="ps-field">
                          <label>Company Name *</label>
                          <input name="company" value={expForm.company} onChange={handleExpChange} />
                        </div>
                        <div className="ps-field">
                          <label>Position *</label>
                          <input name="position" value={expForm.position} onChange={handleExpChange} />
                        </div>
                      </div>
                      <div className="ps-form-row">
                        <div className="ps-field">
                          <label>Start Date *</label>
                          <input type="date" name="start_date" value={expForm.start_date} onChange={handleExpChange} />
                        </div>
                        <div className="ps-field">
                          <label>End Date</label>
                          <input type="date" name="end_date" value={expForm.end_date} onChange={handleExpChange} />
                        </div>
                      </div>
                      <div className="ps-field">
                        <label>Location</label>
                        <input name="location" value={expForm.location} onChange={handleExpChange} />
                      </div>
                      <div className="ps-field">
                        <label>Description</label>
                        <textarea name="description" value={expForm.description} onChange={handleExpChange} rows={3} />
                      </div>
                      <div className="ps-btn-row ps-form-actions">
                        <button className="ps-btn-cancel" onClick={() => setEditingExpId(null)}>
                          <X size={16} />Cancel
                        </button>
                        <button className="ps-btn-save" onClick={saveExp}>
                          <Save size={16} />Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="ps-list-item" key={exp.experience_id}>
                    <div className="ps-list-item-header">
                      <div className="ps-list-item-icon">
                        <Building2 size={18} />
                      </div>
                      <div className="ps-list-item-content">
                        <h4 className="ps-list-item-title">{exp.position}</h4>
                        <p className="ps-list-item-subtitle">{exp.company} • {exp.location || 'Remote'}</p>
                        <div className="ps-list-item-meta">
                          <Calendar size={14} />
                          <span>{exp.start_date} — {exp.end_date || "Present"}</span>
                        </div>
                        {exp.description && <p className="ps-list-item-desc">{exp.description}</p>}
                      </div>
                      <div className="ps-list-item-actions">
                        <button className="ps-icon-btn" onClick={() => startEditExp(exp)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="ps-icon-btn ps-icon-btn-danger" onClick={() => delExp(exp.experience_id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* ── Education Section ── */}
        <div className="ps-card ps-full">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <GraduationCap size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Education</h3>
            </div>
            {editingEduId !== "new" && (
              <button className="ps-btn-add" onClick={() => startEditEdu()}>
                <Plus size={16} />Add Education
              </button>
            )}
          </div>
          
          {educationsLoading ? (
            <div className="ps-loading-section">
              <div className="ps-spinner-sm" />
              <span>Loading education...</span>
            </div>
          ) : (
            <div className="ps-list">
              {/* Form for new Education */}
              {editingEduId === "new" && (
                <div className="ps-form-card">
                  <div className="ps-form">
                    <div className="ps-form-row">
                      <div className="ps-field">
                        <label>Institution Name *</label>
                        <input name="institution" value={eduForm.institution} onChange={handleEduChange} placeholder="SVKM's NMIMS" />
                      </div>
                      <div className="ps-field">
                        <label>Degree *</label>
                        <input name="degree" value={eduForm.degree} onChange={handleEduChange} placeholder="B.Tech" />
                      </div>
                    </div>
                    <div className="ps-form-row">
                      <div className="ps-field">
                        <label>Field of Study</label>
                        <input name="field_of_study" value={eduForm.field_of_study} onChange={handleEduChange} placeholder="Computer Science" />
                      </div>
                      <div className="ps-field">
                        <label>Grade / CGPA</label>
                        <input name="grade" value={eduForm.grade} onChange={handleEduChange} placeholder="8.5 CGPA" />
                      </div>
                    </div>
                    <div className="ps-form-row">
                      <div className="ps-field">
                        <label>Start Date *</label>
                        <input type="date" name="start_date" value={eduForm.start_date} onChange={handleEduChange} />
                      </div>
                      <div className="ps-field">
                        <label>End Date</label>
                        <input type="date" name="end_date" value={eduForm.end_date} onChange={handleEduChange} />
                      </div>
                    </div>
                    <div className="ps-field">
                      <label>Description</label>
                      <textarea name="description" value={eduForm.description} onChange={handleEduChange} rows={3} placeholder="Relevant coursework, achievements, activities..." />
                    </div>
                    <div className="ps-btn-row ps-form-actions">
                      <button className="ps-btn-cancel" onClick={() => setEditingEduId(null)}>
                        <X size={16} />Cancel
                      </button>
                      <button className="ps-btn-save" onClick={saveEdu}>
                        <Save size={16} />Save Education
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Render Existing Educations */}
              {educations?.length === 0 && editingEduId !== "new" && (
                <div className="ps-empty-state">
                  <GraduationCap size={32} />
                  <p>No education records added yet</p>
                  <span>Click "Add Education" to get started</span>
                </div>
              )}
              
              {educations?.map((edu) => (
                editingEduId === edu.education_id ? (
                  // Inline Edit Form
                  <div className="ps-form-card" key={edu.education_id}>
                    <div className="ps-form">
                      <div className="ps-form-row">
                        <div className="ps-field">
                          <label>Institution Name *</label>
                          <input name="institution" value={eduForm.institution} onChange={handleEduChange} />
                        </div>
                        <div className="ps-field">
                          <label>Degree *</label>
                          <input name="degree" value={eduForm.degree} onChange={handleEduChange} />
                        </div>
                      </div>
                      <div className="ps-form-row">
                        <div className="ps-field">
                          <label>Field of Study</label>
                          <input name="field_of_study" value={eduForm.field_of_study} onChange={handleEduChange} />
                        </div>
                        <div className="ps-field">
                          <label>Grade</label>
                          <input name="grade" value={eduForm.grade} onChange={handleEduChange} />
                        </div>
                      </div>
                      <div className="ps-form-row">
                        <div className="ps-field">
                          <label>Start Date *</label>
                          <input type="date" name="start_date" value={eduForm.start_date} onChange={handleEduChange} />
                        </div>
                        <div className="ps-field">
                          <label>End Date</label>
                          <input type="date" name="end_date" value={eduForm.end_date} onChange={handleEduChange} />
                        </div>
                      </div>
                      <div className="ps-field">
                        <label>Description</label>
                        <textarea name="description" value={eduForm.description} onChange={handleEduChange} rows={3} />
                      </div>
                      <div className="ps-btn-row ps-form-actions">
                        <button className="ps-btn-cancel" onClick={() => setEditingEduId(null)}>
                          <X size={16} />Cancel
                        </button>
                        <button className="ps-btn-save" onClick={saveEdu}>
                          <Save size={16} />Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="ps-list-item" key={edu.education_id}>
                    <div className="ps-list-item-header">
                      <div className="ps-list-item-icon">
                        <GraduationCap size={18} />
                      </div>
                      <div className="ps-list-item-content">
                        <h4 className="ps-list-item-title">{edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}</h4>
                        <p className="ps-list-item-subtitle">{edu.institution}</p>
                        <div className="ps-list-item-meta">
                          <Calendar size={14} />
                          <span>{edu.start_date} — {edu.end_date || "Present"}</span>
                          {edu.grade && <span className="ps-grade">Grade: {edu.grade}</span>}
                        </div>
                        {edu.description && <p className="ps-list-item-desc">{edu.description}</p>}
                      </div>
                      <div className="ps-list-item-actions">
                        <button className="ps-icon-btn" onClick={() => startEditEdu(edu)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="ps-icon-btn ps-icon-btn-danger" onClick={() => delEdu(edu.education_id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* ── Media & Assets ── */}
        <div className="ps-card ps-full">
          <div className="ps-card-header">
            <div className="ps-header-content">
              <FileText size={20} className="ps-header-icon" />
              <h3 className="ps-section-title">Media & Documents</h3>
            </div>
          </div>
          <div className="ps-uploads">
            <div className="ps-upload-card">
              <div className="ps-upload-icon">
                <FileText size={24} />
              </div>
              <div className="ps-upload-info">
                <h4>Resume / CV</h4>
                <p>{profile?.resume_url ? "✓ Resume uploaded" : "Upload your latest PDF resume"}</p>
              </div>
              <label className="ps-btn-upload">
                {isUploadingResume ? (
                  <>
                    <div className="ps-spinner-sm" />
                    Uploading...
                  </>
                ) : (
                  "Choose File"
                )}
                <input type="file" hidden accept=".pdf" onChange={(e) => handleUpload(e, "resume")} disabled={isUploadingResume} />
              </label>
            </div>

            <div className="ps-upload-card">
              <div className="ps-upload-icon">
                <ImageIcon size={24} />
              </div>
              <div className="ps-upload-info">
                <h4>Cover Image</h4>
                <p>{profile?.cover_image ? "✓ Cover uploaded" : "Upload a hero background image"}</p>
              </div>
              <label className="ps-btn-upload">
                {isUploadingCover ? (
                  <>
                    <div className="ps-spinner-sm" />
                    Uploading...
                  </>
                ) : (
                  "Choose File"
                )}
                <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, "cover")} disabled={isUploadingCover} />
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── CSS Variables ── */
        :root {
          --ps-primary: #6366f1;
          --ps-primary-dark: #4f46e5;
          --ps-primary-light: #818cf8;
          --ps-secondary: #8b5cf6;
          --ps-success: #10b981;
          --ps-danger: #ef4444;
          --ps-warning: #f59e0b;
          --ps-info: #3b82f6;
          
          --ps-bg: #f8fafc;
          --ps-card-bg: #ffffff;
          --ps-border: #e2e8f0;
          --ps-text-primary: #0f172a;
          --ps-text-secondary: #475569;
          --ps-text-muted: #94a3b8;
          
          --ps-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --ps-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --ps-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          
          --ps-radius: 12px;
          --ps-radius-sm: 8px;
          --ps-radius-lg: 16px;
          
          --ps-transition: all 0.2s ease;
        }

        /* ── Base Wrapper ── */
        .ps-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 64px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--ps-text-primary);
          background: var(--ps-bg);
          box-sizing: border-box;
        }

        /* ── Page Header ── */
        .ps-page-header {
          margin-bottom: 32px;
        }

        .ps-page-header h2 {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
          color: var(--ps-text-primary);
          line-height: 1.2;
        }

        .ps-gradient-text {
          background: linear-gradient(135deg, var(--ps-primary) 0%, var(--ps-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ps-subtitle {
          color: var(--ps-text-secondary);
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }

        /* ── Cards ── */
        .ps-card {
          background: var(--ps-card-bg);
          border-radius: var(--ps-radius);
          border: 1px solid var(--ps-border);
          padding: 24px;
          box-shadow: var(--ps-shadow-sm);
          transition: var(--ps-transition);
          box-sizing: border-box;
        }

        .ps-card:hover {
          box-shadow: var(--ps-shadow);
        }

        /* ── Hero Card ── */
        .ps-hero {
          margin-bottom: 24px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%), var(--ps-card-bg);
          border: 2px solid var(--ps-border);
        }

        .ps-hero-body {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .ps-avatar-wrap {
          flex-shrink: 0;
        }

        .ps-avatar {
          width: 96px;
          height: 96px;
          border-radius: var(--ps-radius);
          border: 3px solid var(--ps-border);
          overflow: hidden;
          position: relative;
          background: var(--ps-bg);
          transition: var(--ps-transition);
        }

        .ps-avatar:hover {
          transform: scale(1.05);
          border-color: var(--ps-primary);
        }

        .ps-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ps-avatar-letter {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 800;
          color: var(--ps-primary);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        }

        .ps-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .ps-avatar:hover .ps-avatar-overlay {
          opacity: 1;
        }

        .ps-hero-info {
          flex: 1;
          min-width: 0;
        }

        .ps-hero-name {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
          color: var(--ps-text-primary);
          word-break: break-word;
        }

        .ps-hero-title {
          font-size: 16px;
          color: var(--ps-text-secondary);
          margin: 0 0 16px;
          font-weight: 500;
        }

        .ps-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ps-chip {
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: var(--ps-transition);
        }

        .ps-chip-success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--ps-success);
        }

        .ps-chip-warn {
          background: rgba(245, 158, 11, 0.1);
          color: var(--ps-warning);
        }

        .ps-chip-info {
          background: rgba(59, 130, 246, 0.1);
          color: var(--ps-info);
        }

        /* ── Grid Layout ── */
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .ps-full {
          grid-column: 1 / -1;
        }

        /* ── Card Header ── */
        .ps-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--ps-border);
          gap: 12px;
          flex-wrap: wrap;
        }

        .ps-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .ps-header-icon {
          color: var(--ps-primary);
          flex-shrink: 0;
        }

        .ps-section-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: var(--ps-text-primary);
        }

        /* ── Info List & Items ── */
        .ps-info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ps-info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          background: var(--ps-bg);
          border-radius: var(--ps-radius-sm);
          border: 1px solid var(--ps-border);
          transition: var(--ps-transition);
        }

        .ps-info-item:hover {
          border-color: var(--ps-primary-light);
          background: rgba(99, 102, 241, 0.03);
        }

        .ps-info-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--ps-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .ps-info-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--ps-text-primary);
          word-break: break-word;
        }

        .ps-break {
          word-break: break-all;
        }

        /* ── Summary Section ── */
        .ps-summary-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ps-summary-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ps-summary-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--ps-text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .ps-bio {
          font-size: 15px;
          line-height: 1.6;
          color: var(--ps-text-secondary);
          margin: 0;
        }

        .ps-summary-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px 16px;
          background: var(--ps-bg);
          border-radius: var(--ps-radius-sm);
          border: 1px solid var(--ps-border);
        }

        .ps-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--ps-text-primary);
        }

        .ps-meta-item svg {
          color: var(--ps-primary);
        }

        .ps-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ps-skill {
          font-size: 13px;
          font-weight: 600;
          background: var(--ps-bg);
          border: 1px solid var(--ps-border);
          padding: 6px 12px;
          border-radius: 6px;
          color: var(--ps-text-primary);
          transition: var(--ps-transition);
        }

        .ps-skill:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: var(--ps-primary);
          color: var(--ps-primary);
          transform: translateY(-2px);
        }

        .ps-empty {
          color: var(--ps-text-muted);
          font-style: italic;
        }

        /* ── Forms ── */
        .ps-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ps-form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .ps-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ps-field-grow {
          grid-column: 1 / -1;
        }

        .ps-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--ps-text-primary);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ps-field input,
        .ps-field textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--ps-radius-sm);
          border: 1px solid var(--ps-border);
          background: var(--ps-card-bg);
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: var(--ps-text-primary);
          font-weight: 500;
          transition: var(--ps-transition);
          box-sizing: border-box;
        }

        .ps-field input:focus,
        .ps-field textarea:focus {
          outline: none;
          border-color: var(--ps-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .ps-field textarea {
          resize: vertical;
          min-height: 80px;
          line-height: 1.5;
        }

        .ps-field input::placeholder,
        .ps-field textarea::placeholder {
          color: var(--ps-text-muted);
        }

        /* ── List Items (Experience/Education) ── */
        .ps-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ps-list-item {
          padding: 18px 20px;
          background: var(--ps-bg);
          border-radius: var(--ps-radius);
          border: 1px solid var(--ps-border);
          transition: var(--ps-transition);
        }

        .ps-list-item:hover {
          border-color: var(--ps-primary-light);
          box-shadow: var(--ps-shadow-sm);
        }

        .ps-list-item-header {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .ps-list-item-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--ps-radius-sm);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ps-primary);
          flex-shrink: 0;
        }

        .ps-list-item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ps-list-item-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: var(--ps-text-primary);
        }

        .ps-list-item-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: var(--ps-text-secondary);
          margin: 0;
        }

        .ps-list-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--ps-text-muted);
          flex-wrap: wrap;
        }

        .ps-list-item-meta svg {
          flex-shrink: 0;
        }

        .ps-grade {
          padding: 2px 8px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--ps-success);
          border-radius: 4px;
          font-weight: 600;
        }

        .ps-list-item-desc {
          font-size: 14px;
          line-height: 1.6;
          color: var(--ps-text-secondary);
          margin: 8px 0 0;
        }

        .ps-list-item-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ── Form Card ── */
        .ps-form-card {
          padding: 20px;
          background: rgba(99, 102, 241, 0.03);
          border: 2px solid var(--ps-primary);
          border-radius: var(--ps-radius);
        }

        .ps-form-actions {
          justify-content: flex-end;
          margin-top: 8px;
        }

        /* ── Empty State ── */
        .ps-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: var(--ps-text-muted);
        }

        .ps-empty-state svg {
          color: var(--ps-text-muted);
          opacity: 0.5;
          margin-bottom: 12px;
        }

        .ps-empty-state p {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--ps-text-secondary);
        }

        .ps-empty-state span {
          font-size: 14px;
          color: var(--ps-text-muted);
        }

        /* ── Uploads Section ── */
        .ps-uploads {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .ps-upload-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: var(--ps-radius);
          border: 2px dashed var(--ps-border);
          background: var(--ps-bg);
          transition: var(--ps-transition);
        }

        .ps-upload-card:hover {
          border-color: var(--ps-primary);
          background: rgba(99, 102, 241, 0.03);
        }

        .ps-upload-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--ps-radius-sm);
          flex-shrink: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ps-primary);
        }

        .ps-upload-info {
          flex: 1;
          min-width: 0;
        }

        .ps-upload-info h4 {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 4px;
          color: var(--ps-text-primary);
        }

        .ps-upload-info p {
          font-size: 13px;
          color: var(--ps-text-secondary);
          margin: 0;
        }

        /* ── Buttons ── */
        .ps-btn-edit {
          background: var(--ps-text-primary);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--ps-radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: var(--ps-transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ps-btn-edit:hover {
          background: var(--ps-primary);
          transform: translateY(-2px);
          box-shadow: var(--ps-shadow);
        }

        .ps-btn-edit:active {
          transform: translateY(0);
        }

        .ps-btn-add {
          background: transparent;
          border: 2px dashed var(--ps-primary);
          color: var(--ps-primary);
          padding: 8px 16px;
          border-radius: var(--ps-radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: var(--ps-transition);
          white-space: nowrap;
        }

        .ps-btn-add:hover {
          background: rgba(99, 102, 241, 0.1);
          border-style: solid;
        }

        .ps-btn-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ps-btn-save,
        .ps-btn-cancel {
          border: none;
          padding: 8px 16px;
          border-radius: var(--ps-radius-sm);
          cursor: pointer;
          display: inline-flex;
          font-weight: 600;
          font-size: 14px;
          align-items: center;
          gap: 6px;
          transition: var(--ps-transition);
          white-space: nowrap;
        }

        .ps-btn-save {
          background: var(--ps-success);
          color: white;
        }

        .ps-btn-cancel {
          background: var(--ps-bg);
          color: var(--ps-text-secondary);
          border: 1px solid var(--ps-border);
        }

        .ps-btn-save:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: var(--ps-shadow-sm);
        }

        .ps-btn-cancel:hover {
          background: var(--ps-card-bg);
          border-color: var(--ps-text-secondary);
        }

        .ps-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ps-btn-upload {
          background: var(--ps-primary);
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: var(--ps-radius-sm);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: var(--ps-transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ps-btn-upload:hover:not(:disabled) {
          background: var(--ps-primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--ps-shadow);
        }

        .ps-btn-upload:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Icon Buttons ── */
        .ps-icon-btn {
          background: var(--ps-card-bg);
          border: 1px solid var(--ps-border);
          border-radius: var(--ps-radius-sm);
          padding: 8px;
          color: var(--ps-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--ps-transition);
        }

        .ps-icon-btn:hover {
          background: var(--ps-bg);
          border-color: var(--ps-primary);
          color: var(--ps-primary);
          transform: translateY(-2px);
          box-shadow: var(--ps-shadow-sm);
        }

        .ps-icon-btn-danger:hover {
          border-color: var(--ps-danger);
          color: var(--ps-danger);
          background: rgba(239, 68, 68, 0.05);
        }

        /* ── Spinners ── */
        .ps-spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: ps-spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        @keyframes ps-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Loading State ── */
        .ps-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 16px;
          color: var(--ps-text-muted);
          font-size: 15px;
          font-weight: 500;
        }

        .ps-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--ps-border);
          border-top-color: var(--ps-primary);
          border-radius: 50%;
          animation: ps-spin 0.7s linear infinite;
        }

        .ps-loading-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          gap: 12px;
          color: var(--ps-text-muted);
          font-size: 14px;
        }

        /* ══════════════ RESPONSIVE ══════════════ */
        
        /* Tablets */
        @media (max-width: 1024px) {
          .ps-wrapper {
            padding: 24px 20px 48px;
          }
        }

        /* Small tablets */
        @media (max-width: 768px) {
          .ps-grid {
            grid-template-columns: 1fr;
          }

          .ps-uploads {
            grid-template-columns: 1fr;
          }

          .ps-form-row {
            grid-template-columns: 1fr;
          }

          .ps-card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .ps-btn-row {
            width: 100%;
            justify-content: flex-end;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .ps-wrapper {
            padding: 16px 16px 40px;
          }

          .ps-page-header h2 {
            font-size: 28px;
          }

          .ps-subtitle {
            font-size: 14px;
          }

          .ps-card {
            padding: 20px 16px;
          }

          .ps-hero {
            padding: 20px 16px;
          }

          .ps-hero-body {
            flex-direction: column;
            align-items: flex-start;
          }

          .ps-avatar {
            width: 80px;
            height: 80px;
          }

          .ps-avatar-letter {
            font-size: 32px;
          }

          .ps-hero-name {
            font-size: 24px;
          }

          .ps-hero-title {
            font-size: 14px;
          }

          .ps-section-title {
            font-size: 18px;
          }

          .ps-list-item-header {
            flex-direction: column;
          }

          .ps-list-item-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .ps-upload-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .ps-btn-upload {
            width: 100%;
            justify-content: center;
          }

          .ps-grid {
            gap: 16px;
          }

          .ps-form-card {
            padding: 16px;
          }

          .ps-empty-state {
            padding: 32px 16px;
          }
        }

        /* Extra small mobile */
        @media (max-width: 480px) {
          .ps-wrapper {
            padding: 12px 12px 32px;
          }

          .ps-page-header {
            margin-bottom: 20px;
          }

          .ps-card {
            padding: 16px 14px;
            border-radius: 10px;
          }

          .ps-hero {
            padding: 16px 14px;
          }

          .ps-section-title {
            font-size: 16px;
          }

          .ps-info-value,
          .ps-bio,
          .ps-field input,
          .ps-field textarea {
            font-size: 14px;
          }

          .ps-chip {
            font-size: 12px;
            padding: 5px 10px;
          }

          .ps-skill {
            font-size: 12px;
            padding: 5px 10px;
          }

          .ps-btn-edit,
          .ps-btn-add,
          .ps-btn-save,
          .ps-btn-cancel {
            font-size: 13px;
            padding: 7px 12px;
          }

          .ps-grid {
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;