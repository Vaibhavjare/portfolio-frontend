import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Edit3, Trash2, X, Save, Star, MessageSquare,
  Search, Award, Building2, User,
} from "lucide-react";
import {
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} from "../../redux/services/testimonialApi";
import type {
  Testimonial,
  TestimonialCreateRequest,
  TestimonialUpdateRequest,
} from "../../redux/services/testimonialApi";

/* ─────────────────────────────────────────
   FORM TYPES & HELPERS
───────────────────────────────────────── */
interface FormState {
  name: string;
  designation: string;
  company: string;
  message: string;
  avatar: string;
  rating: number;
  featured: boolean;
}

const BLANK: FormState = {
  name: "",
  designation: "",
  company: "",
  message: "",
  avatar: "",
  rating: 5,
  featured: false,
};

const toForm = (t?: Testimonial | null): FormState => ({
  name:        t?.name ?? "",
  designation: t?.designation ?? "",
  company:     t?.company ?? "",
  message:     t?.message ?? "",
  avatar:      t?.avatar ?? "",
  rating:      t?.rating ?? 5,
  featured:    t?.featured ?? false,
});

const toPayload = (f: FormState): TestimonialCreateRequest => ({
  name:        f.name.trim(),
  designation: f.designation.trim() || undefined,
  company:     f.company.trim() || undefined,
  message:     f.message.trim(),
  avatar:      f.avatar.trim() || undefined,
  rating:      Number(f.rating),
  featured:    f.featured,
});

/* ─────────────────────────────────────────
   STAR RATING COMPONENT
───────────────────────────────────────── */
const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="tm-star-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={readonly ? 16 : 22}
          className={readonly ? "tm-star-readonly" : "tm-star"}
          fill={(hover || value) >= star ? "#fbbf24" : "none"}
          color={(hover || value) >= star ? "#fbbf24" : "#cbd5e1"}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
          style={{ cursor: readonly ? "default" : "pointer" }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const TestimonialManagement = () => {
  const { data: testimonials = [], isLoading, refetch } = useGetTestimonialsQuery({ limit: 100 });
  const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(BLANK);
  const [search,     setSearch]     = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");

  /* Aurora cursor effect on cards */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".tm-aurora-card").forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* Derived stats */
  const stats = useMemo(() => ({
    total: testimonials.length,
    featured: testimonials.filter(t => t.featured).length,
    avgRating: testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + (t.rating ?? 0), 0) / testimonials.length).toFixed(1)
      : "0.0",
    recent: testimonials.filter(t => {
      if (!t.created_at) return false;
      const days = (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length,
  }), [testimonials]);

  /* Filter testimonials */
  const filtered = useMemo(() => testimonials.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.designation?.toLowerCase().includes(q) ||
      t.company?.toLowerCase().includes(q) ||
      t.message.toLowerCase().includes(q);
    
    const matchFeatured = filterFeatured === "all" ||
      (filterFeatured === "featured" && t.featured) ||
      (filterFeatured === "regular" && !t.featured);
    
    return matchSearch && matchFeatured;
  }), [testimonials, search, filterFeatured]);

  /* Modal helpers */
  const openCreate = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
  const openEdit   = (t: Testimonial) => { setEditTarget(t); setForm(toForm(t)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const fc = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  /* Save */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.message.trim()) { toast.error("Message is required."); return; }
    const payload = toPayload(form);
    try {
      if (editTarget) {
        await updateTestimonial({ testimonialId: editTarget.testimonial_id, body: payload as TestimonialUpdateRequest }).unwrap();
        toast.success("Testimonial updated!");
      } else {
        await createTestimonial(payload).unwrap();
        toast.success("Testimonial created!");
      }
      closeModal(); refetch();
    } catch (err: any) {
      const d = err?.data?.detail;
      toast.error(Array.isArray(d) ? d.map((x: any) => `${x.loc?.slice(-1)[0]}: ${x.msg}`).join(", ") : d ?? "Save failed.");
    }
  };

  /* Delete */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTestimonial(deleteId).unwrap();
      toast.success("Testimonial deleted!");
      setDeleteId(null); refetch();
    } catch {
      toast.error("Failed to delete testimonial.");
    }
  };

  /* Loading */
  if (isLoading) {
    return (
      <div className="tm-loading">
        <div className="tm-loading-ring" />
        <span>Loading testimonials…</span>
      </div>
    );
  }

  return (
    <div className="tm-wrapper">
      {/* ══════════════ PAGE HEADER ══════════════ */}
      <div className="tm-page-header">
        <div>
          <h2>Testimonial <span className="tm-gradient-text">Management</span></h2>
          <p className="tm-subtitle">Manage client reviews and feedback</p>
        </div>
        <button className="tm-btn-primary" onClick={openCreate}>
          <Plus size={18} strokeWidth={2.5} />
          Add Testimonial
        </button>
      </div>

      {/* ══════════════ STATS ROW ══════════════ */}
      <div className="tm-stats-row">
        <div className="tm-stat-card tm-aurora-card">
          <div className="tm-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="tm-stat-val">{stats.total}</div>
            <div className="tm-stat-label">Total Testimonials</div>
          </div>
        </div>
        <div className="tm-stat-card tm-aurora-card">
          <div className="tm-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <Star size={20} />
          </div>
          <div>
            <div className="tm-stat-val">{stats.avgRating}</div>
            <div className="tm-stat-label">Average Rating</div>
          </div>
        </div>
        <div className="tm-stat-card tm-aurora-card">
          <div className="tm-stat-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
            <Award size={20} />
          </div>
          <div>
            <div className="tm-stat-val">{stats.featured}</div>
            <div className="tm-stat-label">Featured</div>
          </div>
        </div>
        <div className="tm-stat-card tm-aurora-card">
          <div className="tm-stat-icon" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="tm-stat-val">{stats.recent}</div>
            <div className="tm-stat-label">Recent (30 days)</div>
          </div>
        </div>
      </div>

      {/* ══════════════ FILTERS ══════════════ */}
      <div className="tm-filters">
        <div className="tm-search-wrap">
          <Search size={18} className="tm-search-icon" />
          <input
            type="text"
            placeholder="Search by name, company, designation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="tm-search-input"
          />
        </div>
        <div className="tm-filter-chips">
          {["all", "featured", "regular"].map(f => (
            <button
              key={f}
              className={`tm-filter-chip ${filterFeatured === f ? "tm-filter-chip-active" : ""}`}
              onClick={() => setFilterFeatured(f as any)}
            >
              {f === "all" ? "All" : f === "featured" ? "Featured" : "Regular"}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ TESTIMONIALS GRID ══════════════ */}
      {filtered.length === 0 ? (
        <div className="tm-empty">
          <div className="tm-empty-glyph">💬</div>
          <h3 className="tm-empty-title">No testimonials found</h3>
          <p className="tm-empty-sub">
            {search || filterFeatured !== "all"
              ? "Try adjusting your filters"
              : "Click 'Add Testimonial' to create your first one"}
          </p>
        </div>
      ) : (
        <div className="tm-grid">
          {filtered.map((testimonial) => (
            <div key={testimonial.testimonial_id} className="tm-card tm-aurora-card">
              {/* Card Header */}
              <div className="tm-card-header">
                <div className="tm-card-avatar">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} />
                  ) : (
                    <div className="tm-card-avatar-letter">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="tm-card-info">
                  <h3 className="tm-card-name">{testimonial.name}</h3>
                  {testimonial.designation && (
                    <p className="tm-card-designation">{testimonial.designation}</p>
                  )}
                  {testimonial.company && (
                    <p className="tm-card-company">
                      <Building2 size={12} />
                      {testimonial.company}
                    </p>
                  )}
                </div>
                <div className="tm-card-actions">
                  <button
                    className="tm-icon-btn"
                    onClick={() => openEdit(testimonial)}
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="tm-icon-btn tm-icon-btn-danger"
                    onClick={() => setDeleteId(testimonial.testimonial_id)}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="tm-card-message">
                <p>"{testimonial.message}"</p>
              </div>

              {/* Footer */}
              <div className="tm-card-footer">
                <StarRating value={testimonial.rating ?? 5} readonly />
                {testimonial.featured && (
                  <span className="tm-badge tm-badge-featured">
                    <Award size={12} />
                    Featured
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ CREATE/EDIT MODAL ══════════════ */}
      {modalOpen && (
        <div className="tm-modal-overlay" onClick={closeModal}>
          <div className="tm-modal" onClick={e => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h3>{editTarget ? "Edit Testimonial" : "Add New Testimonial"}</h3>
              <button className="tm-modal-x" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="tm-modal-body">
              {/* Name & Avatar */}
              <div className="tm-m2col">
                <div className="tm-mfield tm-mfield-grow">
                  <label>
                    <User size={12} />
                    Name <span className="tm-req">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={fc("name")}
                    placeholder="John Doe"
                  />
                </div>
                <div className="tm-mfield tm-mfield-grow">
                  <label>Avatar URL</label>
                  <input
                    type="text"
                    value={form.avatar}
                    onChange={fc("avatar")}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Designation & Company */}
              <div className="tm-m2col">
                <div className="tm-mfield">
                  <label>Designation</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={fc("designation")}
                    placeholder="Industry Expert"
                  />
                </div>
                <div className="tm-mfield">
                  <label>
                    <Building2 size={12} />
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={fc("company")}
                    placeholder="Infotech Incorporate"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="tm-mfield">
                <label>
                  <MessageSquare size={12} />
                  Testimonial Message <span className="tm-req">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={fc("message")}
                  rows={5}
                  placeholder="Write the testimonial message here..."
                />
              </div>

              {/* Rating */}
              <div className="tm-mfield">
                <label>
                  <Star size={12} />
                  Rating <span className="tm-req">*</span>
                </label>
                <StarRating
                  value={form.rating}
                  onChange={(v) => setForm(prev => ({ ...prev, rating: v }))}
                />
              </div>

              {/* Featured Toggle */}
              <div className="tm-mfield tm-mfield-toggle">
                <label style={{ marginBottom: 6 }}>
                  <Award size={12} />
                  Featured Testimonial
                </label>
                <label className="tm-sw">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={fc("featured")}
                  />
                  <div className="tm-sw-track">
                    <div className="tm-sw-thumb" />
                  </div>
                </label>
              </div>

              {/* Live Preview */}
              <div
                className="tm-preview-block"
                style={{
                  borderColor: "rgba(99,102,241,0.25)",
                  background: "rgba(99,102,241,0.04)",
                }}
              >
                <div className="tm-preview-left">
                  <div
                    className="tm-preview-avatar"
                    style={{
                      background: form.avatar
                        ? `url(${form.avatar})`
                        : "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!form.avatar && (
                      <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>
                        {form.name.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="tm-preview-name">{form.name || "Name"}</div>
                    <div className="tm-preview-title">
                      {form.designation || "Designation"}
                      {form.company && ` @ ${form.company}`}
                    </div>
                  </div>
                </div>
                <StarRating value={form.rating} readonly />
              </div>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="tm-btn-save"
                onClick={handleSave}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="tm-spin-sm" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editTarget ? "Update" : "Create"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DELETE CONFIRMATION ══════════════ */}
      {deleteId && (
        <div className="tm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="tm-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="tm-confirm-glyph">⚠️</div>
            <h3>Delete Testimonial?</h3>
            <p>This action cannot be undone. The testimonial will be permanently removed.</p>
            <div className="tm-confirm-row">
              <button className="tm-btn-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="tm-btn-danger" onClick={handleDelete}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── Variables ── */
        :root {
          --tm-bg:     #F7F8FC;
          --tm-card:   #FFFFFF;
          --tm-border: rgba(15,23,42,0.10);
          --tm-text:   #0F172A;
          --tm-muted:  rgba(15,23,42,0.55);
          --tm-purple: #6366f1;
          --tm-red:    #ef4444;
        }

        /* ── Keyframes ── */
        @keyframes tm-fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tm-fadeUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes tm-modalSlide { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes tm-spin360  { to{transform:rotate(360deg)} }

        /* ── Base Wrapper ── */
        .tm-wrapper {
          width:100%; max-width:1300px; margin:0 auto; padding:32px 24px 64px;
          box-sizing:border-box; font-family:'Inter',sans-serif; color:var(--tm-text);
          background: radial-gradient(60% 70% at 20% 25%, rgba(99,102,241,0.06) 0%, transparent 60%), var(--tm-bg);
        }

        /* ── Page Header ── */
        .tm-page-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          margin-bottom:28px; gap:20px; flex-wrap:wrap;
          animation:tm-fadeDown 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .tm-page-header h2 {
          font-size:clamp(26px,5vw,36px); font-weight:900; letter-spacing:-0.03em;
          margin:0 0 6px; line-height:1.1;
        }
        .tm-gradient-text {
          background:linear-gradient(90deg, #6366f1 0%, #a855f7 110%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .tm-subtitle {
          color:var(--tm-muted); font-size:15px; margin:0; font-weight:500;
        }

        /* ── Primary Button ── */
        .tm-btn-primary {
          background:#000; color:#fff; border:none;
          padding:11px 20px; border-radius:10px; font-weight:800; font-size:14px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif;
          box-shadow:0 4px 16px rgba(0,0,0,0.14);
          transition:all 0.22s cubic-bezier(.22,1,.36,1);
        }
        .tm-btn-primary:hover {
          background:var(--tm-purple); transform:translateY(-3px);
          box-shadow:0 8px 24px rgba(99,102,241,0.35);
        }
        .tm-btn-primary:active { transform:translateY(-1px); }

        /* ── Stats Row ── */
        .tm-stats-row {
          display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:28px;
          animation:tm-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.08s;
        }
        .tm-stat-card {
          background:var(--tm-card); border-radius:14px; border:1px solid var(--tm-border);
          padding:20px; box-shadow:0 4px 14px rgba(2,6,23,0.04);
          display:flex; align-items:center; gap:14px; position:relative; overflow:hidden;
          transition:all 0.22s ease;
        }
        .tm-stat-card:hover { transform:translateY(-3px); box-shadow:0 8px 22px rgba(2,6,23,0.08); }

        .tm-aurora-card::before {
          content:""; position:absolute; inset:0; border-radius:inherit; padding:2px;
          background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,0.14), transparent 40%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; z-index:1;
        }
        .tm-aurora-card::after {
          content:""; position:absolute; inset:0;
          background:radial-gradient(800px circle at var(--mx,50%) var(--my,50%), rgba(168,85,247,0.03), transparent 40%);
          pointer-events:none; z-index:0;
        }

        .tm-stat-icon {
          width:46px; height:46px; border-radius:11px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(99,102,241,0.18);
        }
        .tm-stat-val {
          font-size:26px; font-weight:900; letter-spacing:-0.02em; margin:0 0 2px;
          color:var(--tm-text); line-height:1;
        }
        .tm-stat-label {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          color:var(--tm-muted); text-transform:uppercase; letter-spacing:0.05em;
        }

        /* ── Filters ── */
        .tm-filters {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:24px; gap:16px; flex-wrap:wrap;
          animation:tm-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.12s;
        }
        .tm-search-wrap {
          position:relative; max-width:360px; flex:1;
        }
        .tm-search-icon {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--tm-muted); pointer-events:none;
        }
        .tm-search-input {
          width:100%; padding:11px 14px 11px 42px; border-radius:10px;
          border:1px solid var(--tm-border); background:var(--tm-card);
          font-family:'Inter',sans-serif; font-size:14px; color:var(--tm-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .tm-search-input:focus {
          outline:none; border-color:var(--tm-purple);
          box-shadow:0 0 0 3px rgba(99,102,241,0.11); transform:translateY(-1px);
        }
        .tm-search-input::placeholder { color:var(--tm-muted); font-weight:500; }

        .tm-filter-chips {
          display:flex; gap:8px; flex-wrap:wrap;
        }
        .tm-filter-chip {
          background:rgba(15,23,42,0.04); border:1px solid var(--tm-border);
          color:var(--tm-text); padding:8px 16px; border-radius:8px;
          font-weight:700; font-size:13px; cursor:pointer;
          font-family:'Inter',sans-serif; transition:all 0.2s ease;
        }
        .tm-filter-chip:hover {
          background:rgba(15,23,42,0.08); border-color:rgba(99,102,241,0.3);
        }
        .tm-filter-chip-active {
          background:var(--tm-purple); color:#fff; border-color:var(--tm-purple);
        }

        /* ── Testimonial Grid ── */
        .tm-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr));
          gap:20px; animation:tm-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.16s;
        }
        .tm-card {
          background:var(--tm-card); border-radius:14px; border:1px solid var(--tm-border);
          padding:24px; box-shadow:0 4px 14px rgba(2,6,23,0.04);
          position:relative; overflow:hidden;
          display:flex; flex-direction:column; gap:16px;
          transition:all 0.22s ease;
        }
        .tm-card:hover {
          transform:translateY(-4px); box-shadow:0 12px 28px rgba(2,6,23,0.10);
        }

        /* Card Header */
        .tm-card-header {
          display:flex; gap:14px; align-items:flex-start; position:relative; z-index:2;
        }
        .tm-card-avatar {
          width:52px; height:52px; border-radius:50%; overflow:hidden;
          border:2px solid var(--tm-border); flex-shrink:0;
          background:linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        }
        .tm-card-avatar img {
          width:100%; height:100%; object-fit:cover; display:block;
        }
        .tm-card-avatar-letter {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
          font-size:20px; font-weight:900; color:#fff;
        }
        .tm-card-info {
          flex:1; min-width:0;
        }
        .tm-card-name {
          font-size:16px; font-weight:800; margin:0 0 4px; color:var(--tm-text);
        }
        .tm-card-designation {
          font-size:13px; color:var(--tm-muted); margin:0 0 3px; font-weight:600;
        }
        .tm-card-company {
          font-family:'IBM Plex Mono',monospace; font-size:12px;
          color:var(--tm-muted); margin:0; display:flex; align-items:center; gap:4px;
        }
        .tm-card-actions {
          display:flex; gap:6px; flex-shrink:0;
        }

        /* Icon Buttons */
        .tm-icon-btn {
          background:rgba(15,23,42,0.04); border:1px solid transparent;
          border-radius:8px; padding:7px; color:var(--tm-muted);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .tm-icon-btn:hover {
          background:rgba(99,102,241,0.10); border-color:rgba(99,102,241,0.25);
          color:var(--tm-purple); transform:translateY(-2px);
        }
        .tm-icon-btn-danger:hover {
          background:rgba(239,68,68,0.10); border-color:rgba(239,68,68,0.25);
          color:var(--tm-red);
        }

        /* Message */
        .tm-card-message {
          flex:1; position:relative; z-index:2;
        }
        .tm-card-message p {
          font-size:14px; line-height:1.65; color:var(--tm-text);
          margin:0; font-style:italic;
        }

        /* Footer */
        .tm-card-footer {
          display:flex; justify-content:space-between; align-items:center;
          border-top:1px solid var(--tm-border); padding-top:14px;
          position:relative; z-index:2;
        }
        .tm-badge {
          font-size:11px; font-weight:800; padding:5px 10px; border-radius:6px;
          display:inline-flex; align-items:center; gap:5px;
          font-family:'IBM Plex Mono',monospace; text-transform:uppercase; letter-spacing:0.04em;
        }
        .tm-badge-featured {
          background:rgba(245,158,11,0.13); color:#d97706; border:1px solid rgba(245,158,11,0.25);
        }

        /* Star Rating */
        .tm-star-row {
          display:flex; gap:4px;
        }
        .tm-star {
          transition:transform 0.15s;
        }
        .tm-star:hover {
          transform:scale(1.15);
        }
        .tm-star-readonly {
          flex-shrink:0;
        }

        /* ── Modal Overlay ── */
        .tm-modal-overlay {
          position:fixed; inset:0; background:rgba(2,6,23,0.60);
          backdrop-filter:blur(8px); z-index:9999;
          display:flex; align-items:center; justify-content:center;
          padding:20px; box-sizing:border-box;
          animation:tm-fadeDown 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .tm-modal {
          background:var(--tm-card); border-radius:18px; border:1px solid var(--tm-border);
          box-shadow:0 32px 80px rgba(2,6,23,0.24); width:100%; max-width:620px;
          max-height:92vh; display:flex; flex-direction:column;
          animation:tm-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.08s;
        }

        .tm-modal-header {
          display:flex; justify-content:space-between; align-items:center;
          padding:22px 24px; border-bottom:1px solid var(--tm-border); flex-shrink:0;
        }
        .tm-modal-header h3 {
          font-size:20px; font-weight:900; margin:0;
        }
        .tm-modal-x {
          background:transparent; border:none; padding:6px; border-radius:8px;
          cursor:pointer; display:flex; color:var(--tm-muted);
          transition:background 0.15s, transform 0.15s;
        }
        .tm-modal-x:hover { background:rgba(15,23,42,0.12); transform:rotate(90deg); }

        .tm-modal-body {
          padding:22px 24px; overflow-y:auto;
          display:flex; flex-direction:column; gap:16px; flex:1;
        }
        .tm-modal-footer {
          display:flex; justify-content:flex-end; gap:10px;
          padding:16px 24px; border-top:1px solid var(--tm-border); flex-shrink:0;
        }

        /* Modal form layout */
        .tm-m2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .tm-mfield { display:flex; flex-direction:column; gap:5px; }
        .tm-mfield-grow { flex:1; min-width:150px; }
        .tm-mfield-toggle { flex-shrink:0; }

        .tm-mfield label {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          color:var(--tm-muted); text-transform:uppercase; letter-spacing:0.06em;
          display:flex; align-items:center; gap:4px;
        }
        .tm-req { color:var(--tm-red); }

        .tm-mfield input:not([type=checkbox]),
        .tm-mfield textarea {
          width:100%; padding:11px 14px; border-radius:10px;
          border:1px solid var(--tm-border); background:rgba(0,0,0,0.02);
          font-family:'Inter',sans-serif; font-size:14px; color:var(--tm-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .tm-mfield input:focus, .tm-mfield textarea:focus {
          outline:none; border-color:var(--tm-purple); background:#fff;
          box-shadow:0 0 0 3px rgba(99,102,241,0.11); transform:translateY(-1px);
        }
        .tm-mfield textarea { resize:vertical; line-height:1.5; }

        /* Toggle switch */
        .tm-sw { display:inline-flex; align-items:center; cursor:pointer; margin-top:4px; }
        .tm-sw input { display:none; }
        .tm-sw-track {
          width:44px; height:24px; border-radius:999px;
          background:rgba(15,23,42,0.12); position:relative;
          transition:background 0.22s cubic-bezier(.22,1,.36,1);
          border:1px solid var(--tm-border);
        }
        .tm-sw input:checked + .tm-sw-track { background:var(--tm-purple); border-color:var(--tm-purple); }
        .tm-sw-thumb {
          position:absolute; top:2px; left:2px; width:18px; height:18px;
          border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.20);
          transition:transform 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        .tm-sw input:checked + .tm-sw-track .tm-sw-thumb { transform:translateX(20px); }

        /* Live preview block */
        .tm-preview-block {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 18px; border-radius:10px; border:1px solid;
          gap:12px; flex-wrap:wrap;
        }
        .tm-preview-left { display:flex; align-items:center; gap:12px; }
        .tm-preview-avatar {
          width:42px; height:42px; border-radius:50%; flex-shrink:0;
          border:2px solid rgba(99,102,241,0.2);
          display:flex; align-items:center; justify-content:center; overflow:hidden;
        }
        .tm-preview-name { font-size:14px; font-weight:800; margin:0 0 2px; }
        .tm-preview-title { font-size:12px; font-family:'IBM Plex Mono',monospace; color:var(--tm-muted); margin:0; }

        /* Buttons */
        .tm-btn-ghost {
          background:rgba(15,23,42,0.06); color:var(--tm-text); border:none;
          padding:10px 18px; border-radius:8px; font-weight:700; font-size:14px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .tm-btn-ghost:hover { background:rgba(15,23,42,0.11); }

        .tm-btn-save {
          background:var(--tm-purple); color:#fff; border:none;
          padding:10px 22px; border-radius:8px; font-weight:800; font-size:14px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif;
          box-shadow:0 4px 16px rgba(99,102,241,0.28);
          transition:all 0.22s ease;
        }
        .tm-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,0.38); }
        .tm-btn-save:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

        .tm-btn-danger {
          background:rgba(239,68,68,0.10); color:var(--tm-red); border:none;
          padding:10px 18px; border-radius:8px; font-weight:800; font-size:14px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .tm-btn-danger:hover { background:rgba(239,68,68,0.18); }

        /* Confirm box */
        .tm-confirm-box {
          background:var(--tm-card); border-radius:16px; border:1px solid var(--tm-border);
          box-shadow:0 28px 70px rgba(2,6,23,0.20); padding:32px 28px;
          text-align:center; max-width:380px; width:100%;
          animation:tm-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .tm-confirm-glyph { font-size:48px; margin-bottom:14px; }
        .tm-confirm-box h3 { font-size:19px; font-weight:900; margin:0 0 8px; }
        .tm-confirm-box p  { color:var(--tm-muted); font-size:14px; margin:0 0 24px; line-height:1.5; }
        .tm-confirm-row { display:flex; gap:10px; justify-content:center; }

        /* Spinners */
        .tm-spin-sm {
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff; border-radius:50%; animation:tm-spin360 0.5s linear infinite;
        }
        .tm-loading-ring {
          width:40px; height:40px; border:3px solid rgba(99,102,241,0.18);
          border-top-color:var(--tm-purple); border-radius:50%; animation:tm-spin360 0.7s linear infinite;
        }
        .tm-loading {
          display:flex; flex-direction:column; align-items:center;
          padding:100px 20px; gap:16px;
          font-family:'IBM Plex Mono',monospace; font-size:14px; color:var(--tm-muted);
        }

        /* Empty */
        .tm-empty {
          display:flex; flex-direction:column; align-items:center;
          padding:80px 20px; gap:14px; text-align:center;
        }
        .tm-empty-glyph { font-size:56px; }
        .tm-empty-title { font-size:22px; font-weight:900; margin:0; }
        .tm-empty-sub   { color:var(--tm-muted); font-size:15px; margin:0; max-width:320px; }

        /* ── Responsive ── */
        @media (max-width:1024px) {
          .tm-stats-row { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .tm-wrapper { padding:20px 16px 48px; }
          .tm-m2col { grid-template-columns:1fr; }
          .tm-grid  { grid-template-columns:1fr; }
          .tm-stats-row { grid-template-columns:1fr; }
          .tm-modal { max-height:96vh; }
          .tm-modal-body { padding:16px; }
          .tm-modal-header, .tm-modal-footer { padding:14px 16px; }
          .tm-filters { flex-direction:column; align-items:stretch; }
          .tm-search-wrap { max-width:100%; }
          .tm-page-header { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
    </div>
  );
};

export default TestimonialManagement;