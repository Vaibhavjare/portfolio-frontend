import React, { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus, Edit3, Trash2, X, Save, Star, Tag,
  Zap, Search, ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from "../../redux/services/skillApi";
import type {
  Skill,
  SkillCreateRequest,
  SkillUpdateRequest,
  ProficiencyLevel,
} from "../../redux/services/skillApi";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  "Beginner", "Elementary", "Intermediate", "Advanced", "Expert",
];

const PROF: Record<ProficiencyLevel, { color: string; bg: string; pct: number }> = {
  Beginner:     { color: "#94a3b8", bg: "rgba(148,163,184,0.13)", pct: 20  },
  Elementary:   { color: "#38bdf8", bg: "rgba(56,189,248,0.13)",  pct: 40  },
  Intermediate: { color: "#f59e0b", bg: "rgba(245,158,11,0.13)",  pct: 60  },
  Advanced:     { color: "#22c55e", bg: "rgba(34,197,94,0.13)",   pct: 80  },
  Expert:       { color: "#3E18F9", bg: "rgba(62,24,249,0.13)",   pct: 100 },
};

/* ─────────────────────────────────────────
   FORM TYPES & HELPERS
───────────────────────────────────────── */
interface FormState {
  name: string;
  description: string;
  rating: number;
  proficiency_level: ProficiencyLevel;
  category: string;
  years_of_experience: number;
  icon_url: string;
  color: string;
  tags: string;
  featured: boolean;
  display_order: number;
  is_active: boolean;
}

const BLANK: FormState = {
  name: "", description: "", rating: 5,
  proficiency_level: "Intermediate", category: "",
  years_of_experience: 0, icon_url: "", color: "#3E18F9",
  tags: "", featured: false, display_order: 0, is_active: true,
};

const toForm = (s?: Skill | null): FormState => ({
  name:                s?.name ?? "",
  description:         s?.description ?? "",
  rating:              s?.rating ?? 5,
  proficiency_level:   (s?.proficiency_level as ProficiencyLevel) ?? "Intermediate",
  category:            s?.category ?? "",
  years_of_experience: s?.years_of_experience ?? 0,
  icon_url:            s?.icon_url ?? "",
  color:               s?.color ?? "#3E18F9",
  tags:                (s?.tags ?? []).join(", "),
  featured:            s?.featured ?? false,
  display_order:       s?.display_order ?? 0,
  is_active:           s?.is_active ?? true,
});

const toPayload = (f: FormState): SkillCreateRequest => ({
  name:                f.name.trim(),
  description:         f.description.trim() || undefined,
  rating:              Number(f.rating),
  proficiency_level:   f.proficiency_level,
  category:            f.category.trim() || undefined,
  years_of_experience: Number(f.years_of_experience),
  icon_url:            f.icon_url.trim() || undefined,
  color:               f.color.trim() || undefined,
  tags:                f.tags.split(",").map(t => t.trim()).filter(Boolean),
  featured:            f.featured,
  display_order:       Number(f.display_order),
  is_active:           f.is_active,
});

/* ─────────────────────────────────────────
   ANIMATED RATING BAR (CSS width transition)
───────────────────────────────────────── */
const RatingBar = ({ value, color }: { value: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start from 0, then animate to actual width
    el.style.width = "0%";
    const t = setTimeout(() => { el.style.width = `${(value / 10) * 100}%`; }, 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="sk-bar-track">
      <div ref={ref} className="sk-bar-fill" style={{ background: color }} />
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const SkillsManager = () => {
  const { data: skills = [], isLoading, refetch } = useGetSkillsQuery({});
  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(BLANK);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("All");

  /* Aurora cursor effect on cards */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".sk-aurora-card").forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* Derived */
  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map(s => s.category).filter(Boolean))) as string[];
    return ["All", ...cats];
  }, [skills]);

  const filtered = useMemo(() => skills.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.tags?.some(t => t.toLowerCase().includes(q));
    return matchSearch && (filterCat === "All" || s.category === filterCat);
  }), [skills, search, filterCat]);

  /* Modal helpers */
  const openCreate = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
  const openEdit   = (s: Skill) => { setEditTarget(s); setForm(toForm(s)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const fc = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  /* Save */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Skill name is required."); return; }
    const payload = toPayload(form);
    try {
      if (editTarget) {
        await updateSkill({ skillId: editTarget.skill_id, body: payload as SkillUpdateRequest }).unwrap();
        toast.success("Skill updated!");
      } else {
        await createSkill(payload).unwrap();
        toast.success("Skill created!");
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
    try { await deleteSkill(deleteId).unwrap(); toast.success("Skill deleted."); setDeleteId(null); refetch(); }
    catch { toast.error("Delete failed."); }
  };

  /* Quick toggle */
  const toggleActive = async (s: Skill) => {
    try { await updateSkill({ skillId: s.skill_id, body: { is_active: !s.is_active } }).unwrap(); refetch(); }
    catch { toast.error("Toggle failed."); }
  };

  if (isLoading) return (
    <div className="sk-loading">
      <div className="sk-loading-ring" />
      <p>Loading skills…</p>
    </div>
  );

  const profMeta = PROF[form.proficiency_level] ?? PROF.Intermediate;

  return (
    <div className="sk-wrapper">

      {/* ══════ PAGE HEADER ══════ */}
      <div className="sk-page-header sk-anim-down">
        <div>
          <h2 className="sk-title">
            Skills <span className="sk-grad">Manager</span>
          </h2>
          <p className="sk-subtitle">
            <span className="sk-stat">{skills.length} total</span>
            <span className="sk-dot">·</span>
            <span className="sk-stat">{skills.filter(s => s.featured).length} featured</span>
            <span className="sk-dot">·</span>
            <span className="sk-stat sk-stat-green">{skills.filter(s => s.is_active).length} active</span>
          </p>
        </div>
        <button className="sk-btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> Add Skill
        </button>
      </div>

      {/* ══════ FILTERS ══════ */}
      <div className="sk-filters sk-anim-up" style={{ animationDelay: "0.06s" }}>
        <div className="sk-search-wrap">
          <Search size={13} className="sk-search-ico" />
          <input
            className="sk-search-input"
            placeholder="Search name, category, tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sk-search-clear" onClick={() => setSearch("")}><X size={12} /></button>
          )}
        </div>
        <div className="sk-cat-pills">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`sk-pill${filterCat === c ? " sk-pill-active" : ""}`}
              style={{ animationDelay: `${0.08 + i * 0.04}s` }}
              onClick={() => setFilterCat(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ══════ STATS ROW ══════ */}
      {skills.length > 0 && (
        <div className="sk-stats-row sk-anim-up" style={{ animationDelay: "0.10s" }}>
          {[
            { label: "Avg Rating", value: (skills.reduce((a, s) => a + (s.rating ?? 0), 0) / skills.length).toFixed(1) },
            { label: "Categories", value: categories.length - 1 },
            { label: "Expert Level", value: skills.filter(s => s.proficiency_level === "Expert").length },
            { label: "Featured",    value: skills.filter(s => s.featured).length },
          ].map(({ label, value }) => (
            <div key={label} className="sk-stat-card">
              <span className="sk-stat-val">{value}</span>
              <span className="sk-stat-lbl">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══════ EMPTY STATE ══════ */}
      {filtered.length === 0 && (
        <div className="sk-empty sk-anim-up">
          <div className="sk-empty-glyph">⚡</div>
          <h3 className="sk-empty-title">
            {search || filterCat !== "All" ? "No matching skills" : "No skills yet"}
          </h3>
          <p className="sk-empty-sub">
            {search || filterCat !== "All"
              ? "Try a different search or category filter."
              : "Add your first skill to showcase your expertise."}
          </p>
          {!search && filterCat === "All" && (
            <button className="sk-btn-primary" onClick={openCreate}><Plus size={14} />Add First Skill</button>
          )}
        </div>
      )}

      {/* ══════ SKILL CARDS GRID ══════ */}
      {filtered.length > 0 && (
        <div className="sk-grid">
          {filtered.map((s, i) => {
            const meta  = PROF[s.proficiency_level as ProficiencyLevel] ?? PROF.Intermediate;
            const accent = s.color || meta.color;
            return (
              <div
                key={s.skill_id}
                className={`sk-card sk-aurora-card sk-anim-up${!s.is_active ? " sk-card-inactive" : ""}`}
                style={{ animationDelay: `${0.08 + i * 0.055}s`, "--accent": accent } as React.CSSProperties}
              >
                {/* Top gradient bar */}
                <div className="sk-card-bar" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

                {/* Header row */}
                <div className="sk-card-head">
                  <div className="sk-card-icon" style={{ background: accent + "18", borderColor: accent + "30" }}>
                    {s.icon_url
                      ? <img src={s.icon_url} alt={s.name} />
                      : <span style={{ color: accent }}>{s.name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="sk-card-title-col">
                    <h3 className="sk-card-name">{s.name}</h3>
                    {s.category && <span className="sk-card-cat">{s.category}</span>}
                  </div>
                  <button
                    className={`sk-active-toggle${s.is_active ? " sk-active-on" : ""}`}
                    onClick={() => toggleActive(s)}
                    title={s.is_active ? "Active" : "Inactive"}
                  >
                    {s.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>

                {/* Description */}
                {s.description && <p className="sk-card-desc">{s.description}</p>}

                {/* Proficiency + rating */}
                <div className="sk-card-prof-row">
                  <span className="sk-prof-badge" style={{ color: meta.color, background: meta.bg }}>
                    {s.proficiency_level ?? "Intermediate"}
                  </span>
                  <span className="sk-rating-num" style={{ color: accent }}>{s.rating ?? 0}<span>/10</span></span>
                </div>
                <RatingBar value={s.rating ?? 0} color={accent} />

                {/* Meta row */}
                <div className="sk-card-meta">
                  {(s.years_of_experience ?? 0) > 0 && (
                    <span className="sk-meta-badge"><Zap size={10} />{s.years_of_experience}yr{s.years_of_experience !== 1 ? "s" : ""}</span>
                  )}
                  {s.featured && (
                    <span className="sk-meta-badge sk-badge-gold"><Star size={10} fill="currentColor" />Featured</span>
                  )}
                  {s.display_order != null && (
                    <span className="sk-meta-badge">#{s.display_order}</span>
                  )}
                </div>

                {/* Tags */}
                {s.tags && s.tags.length > 0 && (
                  <div className="sk-tags-row">
                    {s.tags.slice(0, 4).map(t => (
                      <span key={t} className="sk-tag" style={{ borderColor: accent + "35", color: accent }}>{t}</span>
                    ))}
                    {s.tags.length > 4 && <span className="sk-tag sk-tag-more">+{s.tags.length - 4}</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="sk-card-actions">
                  <button className="sk-act-edit" onClick={() => openEdit(s)}><Edit3 size={13} />Edit</button>
                  <button className="sk-act-del"  onClick={() => setDeleteId(s.skill_id)}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════════ */}
      {modalOpen && (
        <div className="sk-overlay" onClick={closeModal}>
          <div className="sk-modal" onClick={e => e.stopPropagation()}>

            {/* Modal top gradient accent */}
            <div className="sk-modal-accent" />

            <div className="sk-modal-header">
              <div>
                <h3>{editTarget ? "Edit Skill" : "New Skill"}</h3>
                <p className="sk-modal-sub">{editTarget ? `Editing ${editTarget.name}` : "Add a skill to your portfolio"}</p>
              </div>
              <button className="sk-modal-x" onClick={closeModal}><X size={16} /></button>
            </div>

            <div className="sk-modal-body">

              {/* ── Name + toggles row ── */}
              <div className="sk-mrow">
                <div className="sk-mfield sk-mfield-grow">
                  <label>Skill Name <span className="sk-req">*</span></label>
                  <input value={form.name} onChange={fc("name")} placeholder="React, Python, Docker…" />
                </div>
                <div className="sk-mfield sk-mfield-toggle">
                  <label>Featured</label>
                  <label className="sk-sw">
                    <input type="checkbox" checked={form.featured} onChange={fc("featured")} />
                    <span className="sk-sw-track"><span className="sk-sw-thumb" /></span>
                  </label>
                </div>
                <div className="sk-mfield sk-mfield-toggle">
                  <label>Active</label>
                  <label className="sk-sw">
                    <input type="checkbox" checked={form.is_active} onChange={fc("is_active")} />
                    <span className="sk-sw-track"><span className="sk-sw-thumb" /></span>
                  </label>
                </div>
              </div>

              {/* ── Description ── */}
              <div className="sk-mfield">
                <label>Description</label>
                <textarea value={form.description} onChange={fc("description")} rows={2} placeholder="Brief description…" />
              </div>

              {/* ── 2-col grid ── */}
              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Category</label>
                  <input value={form.category} onChange={fc("category")} placeholder="Frontend, Backend, DevOps…" />
                </div>
                <div className="sk-mfield">
                  <label>Icon URL</label>
                  <input value={form.icon_url} onChange={fc("icon_url")} placeholder="https://…/icon.svg" />
                </div>
              </div>

              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Accent Color</label>
                  <div className="sk-color-row">
                    <input type="color" value={form.color} onChange={fc("color")} className="sk-color-swatch" />
                    <input value={form.color} onChange={fc("color")} placeholder="#3E18F9" className="sk-color-hex" />
                  </div>
                </div>
                <div className="sk-mfield">
                  <label>Years of Experience</label>
                  <input type="number" min={0} max={50} value={form.years_of_experience} onChange={fc("years_of_experience")} />
                </div>
              </div>

              {/* ── Proficiency + rating ── */}
              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Proficiency Level</label>
                  <select value={form.proficiency_level} onChange={fc("proficiency_level")}>
                    {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="sk-mfield">
                  <label>
                    Rating —&nbsp;
                    <span style={{ color: profMeta.color, fontWeight: 800 }}>{form.rating}/10</span>
                  </label>
                  <input type="range" min={0} max={10} step={1} value={form.rating} onChange={fc("rating")} className="sk-range" style={{ "--rc": profMeta.color } as React.CSSProperties} />
                </div>
              </div>

              {/* ── Display order + Tags ── */}
              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Display Order</label>
                  <input type="number" min={0} value={form.display_order} onChange={fc("display_order")} />
                </div>
                <div className="sk-mfield">
                  <label><Tag size={11} /> Tags (comma separated)</label>
                  <input value={form.tags} onChange={fc("tags")} placeholder="react, hooks, typescript…" />
                </div>
              </div>

              {/* Live preview bar */}
              <div className="sk-preview-block" style={{ borderColor: profMeta.color + "30", background: profMeta.bg }}>
                <div className="sk-preview-left">
                  <div className="sk-preview-icon" style={{ background: (form.color || profMeta.color) + "20", borderColor: (form.color || profMeta.color) + "40" }}>
                    {form.icon_url
                      ? <img src={form.icon_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <span style={{ color: form.color || profMeta.color, fontWeight: 900, fontSize: 18 }}>
                          {form.name.charAt(0).toUpperCase() || "?"}
                        </span>
                    }
                  </div>
                  <div>
                    <p className="sk-preview-name">{form.name || "Skill Name"}</p>
                    <p className="sk-preview-cat">{form.category || "Category"}</p>
                  </div>
                </div>
                <span className="sk-prof-badge" style={{ color: profMeta.color, background: profMeta.bg }}>
                  {form.proficiency_level}
                </span>
              </div>

            </div>

            <div className="sk-modal-footer">
              <button className="sk-btn-ghost" onClick={closeModal}><X size={13} />Cancel</button>
              <button className="sk-btn-save" onClick={handleSave} disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? <span className="sk-spin-sm" /> : <Save size={13} />}
                {editTarget ? "Save Changes" : "Create Skill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {deleteId && (
        <div className="sk-overlay" onClick={() => setDeleteId(null)}>
          <div className="sk-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="sk-confirm-glyph">🗑️</div>
            <h3>Delete this skill?</h3>
            <p>This action cannot be undone.</p>
            <div className="sk-confirm-row">
              <button className="sk-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="sk-btn-danger" onClick={handleDelete}><Trash2 size={13} />Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;600;800;900&display=swap');

        /* ── Variables ── */
        :root {
          --sk-bg:       #F7F8FC;
          --sk-card:     #FFFFFF;
          --sk-border:   rgba(15,23,42,0.09);
          --sk-text:     #0F172A;
          --sk-muted:    rgba(15,23,42,0.50);
          --sk-purple:   #3E18F9;
          --sk-cyan:     #37D7FA;
          --sk-red:      #ef4444;
          --sk-green:    #22c55e;
          --sk-gold:     #f59e0b;
        }

        /* ── Keyframes ── */
        @keyframes sk-slideDown {
          from { opacity:0; transform:translateY(-18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sk-slideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes sk-fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes sk-popIn {
          0%   { opacity:0; transform:scale(0.72) translateY(12px); }
          70%  { transform:scale(1.03); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes sk-modalSlide {
          from { opacity:0; transform:translateY(28px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes sk-barGrow {
          from { width:0 !important; }
          to   { /* runtime sets width */ }
        }
        @keyframes sk-spin360 { to { transform:rotate(360deg); } }
        @keyframes sk-pulseRing {
          0%,100% { box-shadow:0 0 0 0 rgba(62,24,249,0.25); }
          50%     { box-shadow:0 0 0 8px rgba(62,24,249,0); }
        }
        @keyframes sk-shimmer {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(200%); }
        }
        @keyframes sk-pillPop {
          from { opacity:0; transform:scale(0.8) translateX(-6px); }
          to   { opacity:1; transform:scale(1) translateX(0); }
        }

        /* ── Animation classes ── */
        .sk-anim-down { animation: sk-slideDown 0.5s cubic-bezier(.22,1,.36,1) both; }
        .sk-anim-up   { opacity:0; animation: sk-slideUp 0.5s cubic-bezier(.22,1,.36,1) both; }

        /* ── Wrapper ── */
        .sk-wrapper {
          width:100%; max-width:1200px; margin:0 auto;
          padding:0 0 60px; box-sizing:border-box;
          font-family:'Inter',sans-serif; color:var(--sk-text);
        }

        /* ── Page header ── */
        .sk-page-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          margin-bottom:28px; flex-wrap:wrap; gap:16px;
        }
        .sk-title {
          font-size:clamp(24px,4vw,34px); font-weight:900;
          letter-spacing:-0.035em; margin:0 0 6px; line-height:1.1;
        }
        .sk-grad {
          background:linear-gradient(90deg, var(--sk-purple) 0%, var(--sk-cyan) 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .sk-subtitle {
          display:flex; align-items:center; gap:8px; flex-wrap:wrap;
          font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--sk-muted);
        }
        .sk-stat { font-weight:700; color:var(--sk-text); }
        .sk-stat-green { color:var(--sk-green); }
        .sk-dot { color:var(--sk-border); }

        /* ── Primary button ── */
        .sk-btn-primary {
          background:#0F172A; color:#fff; border:none;
          padding:11px 22px; border-radius:999px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif; white-space:nowrap;
          transition:all 0.22s cubic-bezier(.22,1,.36,1);
          box-shadow:0 4px 16px rgba(15,23,42,0.15);
        }
        .sk-btn-primary:hover {
          background:var(--sk-purple);
          transform:translateY(-2px) scale(1.02);
          box-shadow:0 8px 24px rgba(62,24,249,0.30);
        }
        .sk-btn-primary:active { transform:scale(0.97); }

        /* ── Filters ── */
        .sk-filters {
          display:flex; flex-wrap:wrap; gap:12px; align-items:center;
          margin-bottom:20px;
        }
        .sk-search-wrap {
          position:relative; flex:1; min-width:200px; max-width:320px;
        }
        .sk-search-ico {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--sk-muted); pointer-events:none;
        }
        .sk-search-input {
          width:100%; padding:10px 36px 10px 36px; border-radius:999px;
          border:1px solid var(--sk-border); background:#fff;
          font-family:'Inter',sans-serif; font-size:13px; color:var(--sk-text);
          font-weight:500; transition:all 0.2s ease; box-sizing:border-box;
        }
        .sk-search-input:focus {
          outline:none; border-color:var(--sk-purple);
          box-shadow:0 0 0 3px rgba(62,24,249,0.10);
        }
        .sk-search-clear {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          border:none; background:rgba(15,23,42,0.08); color:var(--sk-muted);
          width:18px; height:18px; border-radius:50%; cursor:pointer;
          display:flex; align-items:center; justify-content:center; padding:0;
          transition:background 0.15s;
        }
        .sk-search-clear:hover { background:rgba(15,23,42,0.14); }

        .sk-cat-pills { display:flex; flex-wrap:wrap; gap:6px; }
        .sk-pill {
          padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700;
          border:1px solid var(--sk-border); background:#fff; color:var(--sk-muted);
          cursor:pointer; font-family:'Inter',sans-serif;
          transition:all 0.18s ease;
          opacity:0; animation: sk-pillPop 0.35s cubic-bezier(.34,1.56,.64,1) both;
        }
        .sk-pill:hover { border-color:rgba(62,24,249,0.35); color:var(--sk-purple); transform:translateY(-1px); }
        .sk-pill-active {
          background:var(--sk-purple); color:#fff;
          border-color:var(--sk-purple);
          box-shadow:0 4px 12px rgba(62,24,249,0.25);
        }
        .sk-pill-active:hover { color:#fff; }

        /* ── Stats row ── */
        .sk-stats-row {
          display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
          margin-bottom:28px;
        }
        .sk-stat-card {
          background:#fff; border:1px solid var(--sk-border); border-radius:12px;
          padding:16px 18px; display:flex; flex-direction:column; gap:4px;
          box-shadow:0 4px 12px rgba(2,6,23,0.04);
          transition:transform 0.2s ease, box-shadow 0.2s ease;
        }
        .sk-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(2,6,23,0.08); }
        .sk-stat-val {
          font-size:26px; font-weight:900; letter-spacing:-0.03em;
          background:linear-gradient(90deg, var(--sk-purple), var(--sk-cyan));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .sk-stat-lbl {
          font-family:'IBM Plex Mono',monospace; font-size:10px;
          font-weight:700; color:var(--sk-muted); text-transform:uppercase; letter-spacing:0.06em;
        }

        /* ── Cards grid ── */
        .sk-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(270px,1fr));
          gap:18px;
        }

        /* ── Skill card ── */
        .sk-card {
          background:var(--sk-card);
          border-radius:16px;
          border:1px solid var(--sk-border);
          box-shadow:0 8px 28px rgba(2,6,23,0.05);
          overflow:hidden; display:flex; flex-direction:column;
          position:relative;
          transition:transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s ease;
        }
        .sk-card:hover {
          transform:translateY(-4px);
          box-shadow:0 20px 48px rgba(2,6,23,0.12);
        }
        .sk-card-inactive { opacity:0.52; filter:saturate(0.4); }
        .sk-card-inactive:hover { opacity:0.70; filter:saturate(0.7); }

        /* Aurora cursor glow */
        .sk-aurora-card::before {
          content:""; position:absolute; inset:0; border-radius:inherit; padding:1.5px;
          background:radial-gradient(560px circle at var(--mx,50%) var(--my,50%),
            rgba(62,24,249,0.18), transparent 42%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          pointer-events:none; z-index:1;
        }
        .sk-aurora-card::after {
          content:""; position:absolute; inset:0;
          background:radial-gradient(700px circle at var(--mx,50%) var(--my,50%),
            rgba(55,215,250,0.05), transparent 42%);
          pointer-events:none; z-index:0;
        }

        .sk-card-bar { height:3px; width:100%; flex-shrink:0; }

        .sk-card-head {
          display:flex; align-items:center; gap:12px;
          padding:16px 16px 8px; position:relative; z-index:2;
        }
        .sk-card-icon {
          width:46px; height:46px; border-radius:11px; flex-shrink:0;
          border:1px solid; display:flex; align-items:center; justify-content:center;
          overflow:hidden; font-size:20px; font-weight:900;
          transition:transform 0.2s ease;
        }
        .sk-card:hover .sk-card-icon { transform:scale(1.08) rotate(-2deg); }
        .sk-card-icon img { width:100%; height:100%; object-fit:contain; }
        .sk-card-title-col { flex:1; min-width:0; }
        .sk-card-name {
          font-size:15px; font-weight:800; margin:0 0 2px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .sk-card-cat {
          font-family:'IBM Plex Mono',monospace; font-size:10px;
          font-weight:700; color:var(--sk-muted); text-transform:uppercase; letter-spacing:0.05em;
        }

        .sk-active-toggle {
          border:none; background:none; cursor:pointer; padding:2px;
          color:var(--sk-muted); display:flex; align-items:center;
          transition:color 0.18s, transform 0.18s;
          position:relative; z-index:2;
        }
        .sk-active-on  { color:var(--sk-green); }
        .sk-active-toggle:hover { transform:scale(1.15); opacity:0.8; }

        .sk-card-desc {
          font-size:12px; line-height:1.55; color:var(--sk-muted);
          margin:0; padding:0 16px 10px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          position:relative; z-index:2;
        }

        /* Proficiency + rating */
        .sk-card-prof-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:0 16px 6px; position:relative; z-index:2;
        }
        .sk-prof-badge {
          font-size:11px; font-weight:800; padding:3px 9px; border-radius:5px;
          font-family:'IBM Plex Mono',monospace; letter-spacing:0.01em;
        }
        .sk-rating-num {
          font-size:18px; font-weight:900; letter-spacing:-0.03em;
          font-family:'IBM Plex Mono',monospace;
        }
        .sk-rating-num span { font-size:11px; color:var(--sk-muted); font-weight:600; }

        /* Bar */
        .sk-bar-track {
          margin:0 16px 12px; height:5px; border-radius:999px;
          background:rgba(15,23,42,0.07); overflow:hidden;
          position:relative; z-index:2;
        }
        .sk-bar-fill {
          height:100%; border-radius:999px;
          transition:width 0.7s cubic-bezier(.22,1,.36,1);
          position:relative;
        }
        /* shimmer on bar */
        .sk-bar-fill::after {
          content:"";
          position:absolute; inset:0;
          background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          animation:sk-shimmer 2s ease-in-out infinite;
        }

        /* Meta */
        .sk-card-meta {
          display:flex; flex-wrap:wrap; gap:5px; padding:0 16px 8px;
          position:relative; z-index:2;
        }
        .sk-meta-badge {
          font-size:10px; font-weight:700; padding:3px 7px; border-radius:5px;
          background:rgba(15,23,42,0.05); border:1px solid var(--sk-border);
          color:var(--sk-muted); display:inline-flex; align-items:center; gap:3px;
          font-family:'IBM Plex Mono',monospace;
        }
        .sk-badge-gold { background:rgba(245,158,11,0.10); color:#b45309; border-color:rgba(245,158,11,0.25); }

        /* Tags */
        .sk-tags-row {
          display:flex; flex-wrap:wrap; gap:4px; padding:0 16px 12px;
          position:relative; z-index:2;
        }
        .sk-tag {
          font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px;
          border:1px solid; background:transparent;
          font-family:'IBM Plex Mono',monospace;
          transition:all 0.15s ease;
        }
        .sk-tag:hover { opacity:0.7; transform:translateY(-1px); }
        .sk-tag-more { border-color:var(--sk-border) !important; color:var(--sk-muted) !important; }

        /* Card actions */
        .sk-card-actions {
          display:flex; gap:6px; padding:10px 14px;
          border-top:1px solid var(--sk-border); margin-top:auto;
          position:relative; z-index:2;
        }
        .sk-act-edit, .sk-act-del {
          border:none; cursor:pointer; border-radius:7px; font-weight:700; font-size:12px;
          display:inline-flex; align-items:center; gap:5px; padding:7px 12px;
          font-family:'Inter',sans-serif; transition:all 0.18s ease;
        }
        .sk-act-edit {
          background:rgba(62,24,249,0.07); color:var(--sk-purple); flex:1; justify-content:center;
        }
        .sk-act-edit:hover { background:rgba(62,24,249,0.14); transform:translateY(-1px); }
        .sk-act-del  { background:rgba(239,68,68,0.07); color:var(--sk-red); }
        .sk-act-del:hover  { background:rgba(239,68,68,0.14); transform:translateY(-1px); }

        /* ── Overlay & Modal ── */
        .sk-overlay {
          position:fixed; inset:0; background:rgba(10,15,30,0.55);
          display:flex; align-items:center; justify-content:center;
          z-index:300; padding:16px; box-sizing:border-box;
          animation:sk-fadeIn 0.2s ease both; backdrop-filter:blur(6px);
        }
        .sk-modal {
          background:var(--sk-card); border-radius:18px;
          border:1px solid var(--sk-border);
          box-shadow:0 40px 100px rgba(2,6,23,0.22);
          width:100%; max-width:620px; max-height:92vh;
          display:flex; flex-direction:column; overflow:hidden;
          animation:sk-modalSlide 0.3s cubic-bezier(.22,1,.36,1) both;
          position:relative;
        }

        .sk-modal-accent {
          position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(90deg, var(--sk-purple) 0%, var(--sk-cyan) 100%);
          animation: sk-pulseRing 3s ease-in-out infinite;
          z-index:10;
        }

        .sk-modal-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:22px 24px 18px; border-bottom:1px solid var(--sk-border); flex-shrink:0;
          margin-top:4px;
        }
        .sk-modal-header h3 { font-size:18px; font-weight:900; margin:0 0 3px; }
        .sk-modal-sub { font-size:12px; color:var(--sk-muted); margin:0; font-family:'IBM Plex Mono',monospace; }
        .sk-modal-x {
          border:none; background:rgba(15,23,42,0.06); color:var(--sk-text);
          width:30px; height:30px; border-radius:8px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:background 0.15s, transform 0.15s;
        }
        .sk-modal-x:hover { background:rgba(15,23,42,0.12); transform:rotate(90deg); }

        .sk-modal-body {
          padding:22px 24px; overflow-y:auto;
          display:flex; flex-direction:column; gap:14px; flex:1;
        }
        .sk-modal-footer {
          display:flex; justify-content:flex-end; gap:10px;
          padding:14px 24px; border-top:1px solid var(--sk-border); flex-shrink:0;
        }

        /* Modal form layout */
        .sk-mrow  { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
        .sk-m2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .sk-mfield { display:flex; flex-direction:column; gap:5px; }
        .sk-mfield-grow   { flex:1; min-width:150px; }
        .sk-mfield-toggle { flex-shrink:0; }

        .sk-mfield label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--sk-muted); text-transform:uppercase; letter-spacing:0.06em;
          display:flex; align-items:center; gap:4px;
        }
        .sk-req { color:var(--sk-red); }

        .sk-mfield input:not([type=checkbox]):not([type=color]):not([type=range]),
        .sk-mfield textarea,
        .sk-mfield select {
          width:100%; padding:9px 13px; border-radius:10px;
          border:1px solid var(--sk-border); background:rgba(0,0,0,0.02);
          font-family:'Inter',sans-serif; font-size:13px; color:var(--sk-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .sk-mfield input:focus, .sk-mfield textarea:focus, .sk-mfield select:focus {
          outline:none; border-color:var(--sk-purple); background:#fff;
          box-shadow:0 0 0 3px rgba(62,24,249,0.11); transform:translateY(-1px);
        }
        .sk-mfield textarea { resize:vertical; }

        /* Color row */
        .sk-color-row   { display:flex; gap:8px; align-items:center; }
        .sk-color-swatch {
          width:40px !important; height:38px; padding:3px !important;
          border-radius:8px !important; cursor:pointer; flex-shrink:0; border:1px solid var(--sk-border) !important;
        }
        .sk-color-hex { flex:1 !important; }

        /* Range */
        .sk-range {
          width:100%; -webkit-appearance:none; appearance:none;
          height:5px; border-radius:999px;
          background:rgba(62,24,249,0.14);
          outline:none; cursor:pointer; padding:0 !important; border:none !important; box-shadow:none !important;
        }
        .sk-range::-webkit-slider-thumb {
          -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
          background:var(--rc, var(--sk-purple)); cursor:pointer;
          box-shadow:0 2px 8px rgba(62,24,249,0.35);
          transition:transform 0.15s;
        }
        .sk-range::-webkit-slider-thumb:hover { transform:scale(1.2); }

        /* Toggle switch */
        .sk-sw { display:inline-flex; align-items:center; cursor:pointer; margin-top:4px; }
        .sk-sw input { display:none; }
        .sk-sw-track {
          width:40px; height:22px; border-radius:999px;
          background:rgba(15,23,42,0.12); position:relative;
          transition:background 0.22s cubic-bezier(.22,1,.36,1);
          border:1px solid var(--sk-border);
        }
        .sk-sw input:checked + .sk-sw-track { background:var(--sk-purple); border-color:var(--sk-purple); }
        .sk-sw-thumb {
          position:absolute; top:2px; left:2px; width:16px; height:16px;
          border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.20);
          transition:transform 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        .sk-sw input:checked + .sk-sw-track .sk-sw-thumb { transform:translateX(18px); }

        /* Live preview block */
        .sk-preview-block {
          display:flex; align-items:center; justify-content:space-between;
          padding:12px 16px; border-radius:10px; border:1px solid;
          gap:12px; flex-wrap:wrap;
        }
        .sk-preview-left { display:flex; align-items:center; gap:10px; }
        .sk-preview-icon {
          width:38px; height:38px; border-radius:9px; flex-shrink:0;
          border:1px solid; display:flex; align-items:center; justify-content:center; overflow:hidden;
        }
        .sk-preview-name { font-size:14px; font-weight:800; margin:0 0 2px; }
        .sk-preview-cat  { font-size:11px; font-family:'IBM Plex Mono',monospace; color:var(--sk-muted); margin:0; }

        /* Buttons */
        .sk-btn-ghost {
          background:rgba(15,23,42,0.06); color:var(--sk-text); border:none;
          padding:9px 16px; border-radius:8px; font-weight:700; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .sk-btn-ghost:hover { background:rgba(15,23,42,0.11); }

        .sk-btn-save {
          background:var(--sk-purple); color:#fff; border:none;
          padding:9px 20px; border-radius:8px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif;
          box-shadow:0 4px 16px rgba(62,24,249,0.28);
          transition:all 0.22s ease;
        }
        .sk-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(62,24,249,0.38); }
        .sk-btn-save:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

        .sk-btn-danger {
          background:rgba(239,68,68,0.10); color:var(--sk-red); border:none;
          padding:9px 16px; border-radius:8px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .sk-btn-danger:hover { background:rgba(239,68,68,0.18); }

        /* Confirm box */
        .sk-confirm-box {
          background:var(--sk-card); border-radius:16px; border:1px solid var(--sk-border);
          box-shadow:0 28px 70px rgba(2,6,23,0.20); padding:32px 28px;
          text-align:center; max-width:350px; width:100%;
          animation:sk-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .sk-confirm-glyph { font-size:44px; margin-bottom:14px; }
        .sk-confirm-box h3 { font-size:18px; font-weight:900; margin:0 0 8px; }
        .sk-confirm-box p  { color:var(--sk-muted); font-size:13px; margin:0 0 24px; }
        .sk-confirm-row { display:flex; gap:10px; justify-content:center; }

        /* Spinners */
        .sk-spin-sm {
          width:13px; height:13px; border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff; border-radius:50%; animation:sk-spin360 0.5s linear infinite;
        }
        .sk-loading-ring {
          width:38px; height:38px; border:3px solid rgba(62,24,249,0.18);
          border-top-color:var(--sk-purple); border-radius:50%; animation:sk-spin360 0.7s linear infinite;
        }
        .sk-loading {
          display:flex; flex-direction:column; align-items:center;
          padding:100px 20px; gap:16px;
          font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--sk-muted);
        }

        /* Empty */
        .sk-empty {
          display:flex; flex-direction:column; align-items:center;
          padding:80px 20px; gap:14px; text-align:center;
        }
        .sk-empty-glyph { font-size:52px; }
        .sk-empty-title { font-size:20px; font-weight:900; margin:0; }
        .sk-empty-sub   { color:var(--sk-muted); font-size:14px; margin:0; max-width:300px; }

        /* ── Responsive ── */
        @media (max-width:900px) {
          .sk-stats-row { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .sk-m2col { grid-template-columns:1fr; }
          .sk-grid  { grid-template-columns:1fr; }
          .sk-stats-row { grid-template-columns:repeat(2,1fr); }
          .sk-modal { max-height:96vh; }
          .sk-modal-body { padding:16px; }
          .sk-modal-header, .sk-modal-footer { padding:14px 16px; }
          .sk-filters { flex-direction:column; align-items:stretch; }
          .sk-search-wrap { max-width:100%; }
          .sk-page-header { flex-direction:column; align-items:flex-start; }
        }
        @media (max-width:400px) {
          .sk-stats-row { grid-template-columns:1fr 1fr; gap:8px; }
          .sk-stat-val  { font-size:20px; }
        }
      `}</style>
    </div>
  );
};

export default SkillsManager;