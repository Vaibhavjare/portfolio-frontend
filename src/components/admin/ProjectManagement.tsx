import React, { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  Plus, Edit3, Trash2, X, Save, Star, Tag,
  Zap, Search, ExternalLink, Github, MonitorPlay, Code2, Database
} from "lucide-react";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "../../redux/services/projectApi";
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "../../redux/services/projectApi";

/* ─────────────────────────────────────────
   FORM TYPES & HELPERS
───────────────────────────────────────── */
interface FormState {
  title: string;
  description: string;
  github_link: string;
  live_demo_url: string;
  thumbnail_url: string;
  video_links: string;
  complexity_score: number;
  featured: boolean;
  programming_languages: string;
  frameworks: string;
  databases: string;
  tools: string;
  tags: string;
}

const BLANK: FormState = {
  title: "", description: "", github_link: "", live_demo_url: "",
  thumbnail_url: "", video_links: "", complexity_score: 5, featured: false,
  programming_languages: "", frameworks: "", databases: "", tools: "", tags: "",
};

// Helper to handle parsing comma-separated strings into arrays for the backend
const parseCSV = (str: string) => str.split(",").map(s => s.trim()).filter(Boolean);
const joinCSV = (arr?: string[]) => (arr || []).join(", ");

const toForm = (p?: Project | null): FormState => ({
  title:                 p?.title ?? "",
  description:           p?.description ?? "",
  github_link:           p?.github_link ?? "",
  live_demo_url:         p?.live_demo_url ?? "",
  thumbnail_url:         p?.thumbnail_url ?? "",
  video_links:           joinCSV(p?.video_links),
  complexity_score:      p?.complexity_score ?? 5,
  featured:              p?.featured ?? false,
  programming_languages: joinCSV(p?.tech_stack?.programming_languages),
  frameworks:            joinCSV(p?.tech_stack?.frameworks),
  databases:             joinCSV(p?.tech_stack?.databases),
  tools:                 joinCSV(p?.tech_stack?.tools),
  tags:                  joinCSV(p?.tags),
});

const toPayload = (f: FormState): ProjectCreateRequest => ({
  title:            f.title.trim(),
  description:      f.description.trim() || undefined,
  github_link:      f.github_link.trim() || undefined,
  live_demo_url:    f.live_demo_url.trim() || undefined,
  thumbnail_url:    f.thumbnail_url.trim() || undefined,
  video_links:      parseCSV(f.video_links),
  complexity_score: Number(f.complexity_score),
  featured:         f.featured,
  tags:             parseCSV(f.tags),
  tech_stack: {
    programming_languages: parseCSV(f.programming_languages),
    frameworks:            parseCSV(f.frameworks),
    databases:             parseCSV(f.databases),
    tools:                 parseCSV(f.tools),
  }
});

/* ─────────────────────────────────────────
   ANIMATED RATING BAR
───────────────────────────────────────── */
const RatingBar = ({ value, color }: { value: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
const ProjectManagement = () => {
  const { data: projects = [], isLoading, refetch } = useGetProjectsQuery({ limit: 60 });
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(BLANK);
  const [search,     setSearch]     = useState("");

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

  const filtered = useMemo(() => projects.filter(p => {
    const q = search.toLowerCase();
    return !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.tech_stack?.programming_languages?.some(l => l.toLowerCase().includes(q));
  }), [projects, search]);

  /* Modal helpers */
  const openCreate = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
  const openEdit   = (p: Project) => { setEditTarget(p); setForm(toForm(p)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const fc = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  /* Save */
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Project title is required."); return; }
    const payload = toPayload(form);
    try {
      if (editTarget) {
        await updateProject({ projectId: editTarget.project_id, body: payload as ProjectUpdateRequest }).unwrap();
        toast.success("Project updated!");
      } else {
        await createProject(payload).unwrap();
        toast.success("Project created!");
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
    try { await deleteProject(deleteId).unwrap(); toast.success("Project deleted."); setDeleteId(null); refetch(); }
    catch { toast.error("Delete failed."); }
  };

  if (isLoading) return (
    <div className="sk-loading">
      <div className="sk-loading-ring" />
      <p>Loading projects…</p>
    </div>
  );

  return (
    <div className="sk-wrapper">
      {/* ══════ PAGE HEADER ══════ */}
      <div className="sk-page-header sk-anim-down">
        <div>
          <h2 className="sk-title">
            Project <span className="sk-grad">Laboratory</span>
          </h2>
          <p className="sk-subtitle">
            <span className="sk-stat">{projects.length} total</span>
            <span className="sk-dot">·</span>
            <span className="sk-stat sk-stat-green">{projects.filter(p => p.featured).length} featured</span>
          </p>
        </div>
        <button className="sk-btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> Deploy Project
        </button>
      </div>

      {/* ══════ FILTERS ══════ */}
      <div className="sk-filters sk-anim-up" style={{ animationDelay: "0.06s" }}>
        <div className="sk-search-wrap">
          <Search size={13} className="sk-search-ico" />
          <input
            className="sk-search-input"
            placeholder="Search projects, tags, languages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sk-search-clear" onClick={() => setSearch("")}><X size={12} /></button>
          )}
        </div>
      </div>

      {/* ══════ EMPTY STATE ══════ */}
      {filtered.length === 0 && (
        <div className="sk-empty sk-anim-up">
          <div className="sk-empty-glyph">⚡</div>
          <h3 className="sk-empty-title">{search ? "No matching projects" : "No projects deployed yet"}</h3>
          <p className="sk-empty-sub">
            {search ? "Try a different search." : "Add your first project to showcase your expertise."}
          </p>
          {!search && (
            <button className="sk-btn-primary" onClick={openCreate}><Plus size={14} />Deploy First Project</button>
          )}
        </div>
      )}

      {/* ══════ PROJECT CARDS GRID ══════ */}
      {filtered.length > 0 && (
        <div className="sk-grid">
          {filtered.map((p, i) => {
            const accent = "#3E18F9"; // Default theme color
            return (
              <div
                key={p.project_id}
                className="sk-card sk-aurora-card sk-anim-up"
                style={{ animationDelay: `${0.08 + i * 0.055}s`, "--accent": accent } as React.CSSProperties}
              >
                <div className="sk-card-bar" style={{ background: `linear-gradient(90deg, ${accent}, #37D7FA)` }} />
                
                <div className="sk-proj-image">
                  <img src={p.thumbnail_url || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600"} alt={p.title} />
                  <div className="sk-proj-overlay" />
                  {p.featured && <span className="sk-meta-badge sk-badge-gold" style={{ position: 'absolute', top: 10, right: 10 }}><Star size={10} fill="currentColor" />Featured</span>}
                </div>

                <div className="sk-card-head" style={{ paddingBottom: 0 }}>
                  <div className="sk-card-title-col">
                    <h3 className="sk-card-name">{p.title}</h3>
                  </div>
                  <div className="sk-proj-links">
                    {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer"><Github size={16}/></a>}
                    {p.live_demo_url && <a href={p.live_demo_url} target="_blank" rel="noreferrer"><ExternalLink size={16}/></a>}
                  </div>
                </div>

                {p.description && <p className="sk-card-desc">{p.description.substring(0, 80)}...</p>}

                <div className="sk-card-prof-row">
                  <span className="sk-prof-badge" style={{ color: accent, background: `${accent}15` }}>
                    Complexity
                  </span>
                  <span className="sk-rating-num" style={{ color: accent }}>{p.complexity_score ?? 0}<span>/10</span></span>
                </div>
                <RatingBar value={p.complexity_score ?? 0} color={accent} />

                {p.tech_stack?.programming_languages && p.tech_stack.programming_languages.length > 0 && (
                  <div className="sk-tags-row">
                    {p.tech_stack.programming_languages.slice(0, 3).map(t => (
                      <span key={t} className="sk-tag" style={{ borderColor: accent + "35", color: accent }}>{t}</span>
                    ))}
                    {p.tech_stack.programming_languages.length > 3 && <span className="sk-tag sk-tag-more">+{p.tech_stack.programming_languages.length - 3}</span>}
                  </div>
                )}

                <div className="sk-card-actions">
                  <button className="sk-act-edit" onClick={() => openEdit(p)}><Edit3 size={13} />Edit</button>
                  <button className="sk-act-del"  onClick={() => setDeleteId(p.project_id)}><Trash2 size={13} /></button>
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
            <div className="sk-modal-accent" />
            <div className="sk-modal-header">
              <div>
                <h3>{editTarget ? "Edit Project" : "Initialize Project"}</h3>
                <p className="sk-modal-sub">{editTarget ? `Editing ${editTarget.title}` : "Deploy a new asset to your portfolio"}</p>
              </div>
              <button className="sk-modal-x" onClick={closeModal}><X size={16} /></button>
            </div>

            <div className="sk-modal-body">
              <div className="sk-mrow">
                <div className="sk-mfield sk-mfield-grow">
                  <label>Project Title <span className="sk-req">*</span></label>
                  <input value={form.title} onChange={fc("title")} placeholder="Mess Management System…" />
                </div>
                <div className="sk-mfield sk-mfield-toggle">
                  <label>Featured</label>
                  <label className="sk-sw">
                    <input type="checkbox" checked={form.featured} onChange={fc("featured")} />
                    <span className="sk-sw-track"><span className="sk-sw-thumb" /></span>
                  </label>
                </div>
              </div>

              <div className="sk-mfield">
                <label>Description</label>
                <textarea value={form.description} onChange={fc("description")} rows={3} placeholder="Technical description…" />
              </div>

              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Thumbnail URL</label>
                  <input type="url" value={form.thumbnail_url} onChange={fc("thumbnail_url")} placeholder="https://…" />
                </div>
                <div className="sk-mfield">
                  <label>Video Links (comma separated)</label>
                  <input type="text" value={form.video_links} onChange={fc("video_links")} placeholder="https://youtube.com/..." />
                </div>
              </div>

              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>Repository (GitHub) Link</label>
                  <input type="url" value={form.github_link} onChange={fc("github_link")} placeholder="https://github.com/..." />
                </div>
                <div className="sk-mfield">
                  <label>Live Demo URL</label>
                  <input type="url" value={form.live_demo_url} onChange={fc("live_demo_url")} placeholder="https://..." />
                </div>
              </div>

              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label>
                    Complexity Score — <span style={{ color: "#3E18F9", fontWeight: 800 }}>{form.complexity_score}/10</span>
                  </label>
                  <input type="range" min={1} max={10} step={1} value={form.complexity_score} onChange={fc("complexity_score")} className="sk-range" style={{ "--rc": "#3E18F9" } as React.CSSProperties} />
                </div>
                <div className="sk-mfield">
                  <label><Tag size={11} /> Tags (comma separated)</label>
                  <input value={form.tags} onChange={fc("tags")} placeholder="Web App, Management..." />
                </div>
              </div>

              <hr style={{ border: 0, height: 1, background: "var(--sk-border)", margin: "10px 0" }} />
              
              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label><Code2 size={11} /> Programming Languages</label>
                  <input value={form.programming_languages} onChange={fc("programming_languages")} placeholder="Python, JavaScript..." />
                </div>
                <div className="sk-mfield">
                  <label><MonitorPlay size={11} /> Frameworks</label>
                  <input value={form.frameworks} onChange={fc("frameworks")} placeholder="Django, React..." />
                </div>
              </div>
              <div className="sk-m2col">
                <div className="sk-mfield">
                  <label><Database size={11} /> Databases</label>
                  <input value={form.databases} onChange={fc("databases")} placeholder="MySQL, PostgreSQL..." />
                </div>
                <div className="sk-mfield">
                  <label><Zap size={11} /> Tools</label>
                  <input value={form.tools} onChange={fc("tools")} placeholder="VS Code, Git, Docker..." />
                </div>
              </div>
            </div>

            <div className="sk-modal-footer">
              <button className="sk-btn-ghost" onClick={closeModal}><X size={13} />Cancel</button>
              <button className="sk-btn-save" onClick={handleSave} disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? <span className="sk-spin-sm" /> : <Save size={13} />}
                {editTarget ? "Commit Changes" : "Deploy Project"}
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
            <h3>Destroy this project?</h3>
            <p>This action cannot be undone.</p>
            <div className="sk-confirm-row">
              <button className="sk-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="sk-btn-danger" onClick={handleDelete}><Trash2 size={13} />Destroy</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;500;600;800;900&display=swap');

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

        @keyframes sk-slideDown { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sk-slideUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sk-fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes sk-modalSlide { from { opacity:0; transform:translateY(28px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes sk-spin360 { to { transform:rotate(360deg); } }
        @keyframes sk-pulseRing { 0%,100% { box-shadow:0 0 0 0 rgba(62,24,249,0.25); } 50% { box-shadow:0 0 0 8px rgba(62,24,249,0); } }
        @keyframes sk-shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(200%); } }

        .sk-anim-down { animation: sk-slideDown 0.5s cubic-bezier(.22,1,.36,1) both; }
        .sk-anim-up   { opacity:0; animation: sk-slideUp 0.5s cubic-bezier(.22,1,.36,1) both; }

        .sk-wrapper { width:100%; max-width:1200px; margin:0 auto; padding:0 0 60px; font-family:'Inter',sans-serif; color:var(--sk-text); box-sizing:border-box;}
        .sk-page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
        .sk-title { font-size:clamp(24px,4vw,34px); font-weight:900; letter-spacing:-0.035em; margin:0 0 6px; line-height:1.1; }
        .sk-grad { background:linear-gradient(90deg, var(--sk-purple) 0%, var(--sk-cyan) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .sk-subtitle { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--sk-muted); }
        .sk-stat { font-weight:700; color:var(--sk-text); }
        .sk-stat-green { color:var(--sk-green); }
        .sk-dot { color:var(--sk-border); }

        .sk-btn-primary { background:#0F172A; color:#fff; border:none; padding:11px 22px; border-radius:999px; font-weight:800; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; transition:all 0.22s; box-shadow:0 4px 16px rgba(15,23,42,0.15); }
        .sk-btn-primary:hover { background:var(--sk-purple); transform:translateY(-2px) scale(1.02); box-shadow:0 8px 24px rgba(62,24,249,0.30); }

        .sk-filters { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:20px; }
        .sk-search-wrap { position:relative; flex:1; min-width:200px; max-width:320px; }
        .sk-search-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--sk-muted); pointer-events:none; }
        .sk-search-input { width:100%; padding:10px 36px 10px 36px; border-radius:999px; border:1px solid var(--sk-border); background:#fff; font-family:'Inter',sans-serif; font-size:13px; color:var(--sk-text); font-weight:500; transition:all 0.2s; box-sizing:border-box; }
        .sk-search-input:focus { outline:none; border-color:var(--sk-purple); box-shadow:0 0 0 3px rgba(62,24,249,0.10); }
        .sk-search-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); border:none; background:rgba(15,23,42,0.08); color:var(--sk-muted); width:18px; height:18px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; }

        .sk-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:22px; }
        .sk-card { background:var(--sk-card); border-radius:16px; border:1px solid var(--sk-border); box-shadow:0 8px 28px rgba(2,6,23,0.05); overflow:hidden; display:flex; flex-direction:column; position:relative; transition:transform 0.22s, box-shadow 0.22s; }
        .sk-card:hover { transform:translateY(-4px); box-shadow:0 20px 48px rgba(2,6,23,0.12); }

        .sk-aurora-card::before { content:""; position:absolute; inset:0; border-radius:inherit; padding:1.5px; background:radial-gradient(560px circle at var(--mx,50%) var(--my,50%), rgba(62,24,249,0.18), transparent 42%); -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; z-index:1; }
        
        .sk-card-bar { height:3px; width:100%; flex-shrink:0; }
        
        .sk-proj-image { width:100%; height:160px; position:relative; overflow:hidden; }
        .sk-proj-image img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
        .sk-card:hover .sk-proj-image img { transform:scale(1.05); }
        .sk-proj-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.4), transparent); }

        .sk-card-head { display:flex; align-items:center; gap:12px; padding:16px 16px 8px; position:relative; z-index:2; justify-content:space-between; }
        .sk-card-title-col { flex:1; min-width:0; }
        .sk-card-name { font-size:16px; font-weight:800; margin:0 0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sk-proj-links { display:flex; gap:10px; color:var(--sk-muted); }
        .sk-proj-links a { color:inherit; transition:0.2s; }
        .sk-proj-links a:hover { color:var(--sk-purple); }

        .sk-card-desc { font-size:12px; line-height:1.55; color:var(--sk-muted); margin:0; padding:10px 16px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; position:relative; z-index:2; }
        
        .sk-card-prof-row { display:flex; justify-content:space-between; align-items:center; padding:0 16px 6px; position:relative; z-index:2; }
        .sk-prof-badge { font-size:11px; font-weight:800; padding:3px 9px; border-radius:5px; font-family:'IBM Plex Mono',monospace; }
        .sk-rating-num { font-size:18px; font-weight:900; font-family:'IBM Plex Mono',monospace; }
        .sk-rating-num span { font-size:11px; color:var(--sk-muted); font-weight:600; }
        
        .sk-bar-track { margin:0 16px 12px; height:5px; border-radius:999px; background:rgba(15,23,42,0.07); overflow:hidden; position:relative; z-index:2; }
        .sk-bar-fill { height:100%; border-radius:999px; transition:width 0.7s; position:relative; }
        .sk-bar-fill::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); animation:sk-shimmer 2s ease-in-out infinite; }

        .sk-tags-row { display:flex; flex-wrap:wrap; gap:4px; padding:0 16px 12px; position:relative; z-index:2; }
        .sk-tag { font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; border:1px solid; background:transparent; font-family:'IBM Plex Mono',monospace; }
        .sk-badge-gold { background:rgba(245,158,11,0.9); color:#fff; border:none; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:800; display:inline-flex; align-items:center; gap:4px; font-family:'IBM Plex Mono',monospace; z-index:3; }

        .sk-card-actions { display:flex; gap:6px; padding:10px 14px; border-top:1px solid var(--sk-border); margin-top:auto; position:relative; z-index:2; }
        .sk-act-edit, .sk-act-del { border:none; cursor:pointer; border-radius:7px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:5px; padding:7px 12px; font-family:'Inter',sans-serif; transition:all 0.18s ease; }
        .sk-act-edit { background:rgba(62,24,249,0.07); color:var(--sk-purple); flex:1; justify-content:center; }
        .sk-act-edit:hover { background:rgba(62,24,249,0.14); transform:translateY(-1px); }
        .sk-act-del  { background:rgba(239,68,68,0.07); color:var(--sk-red); }
        .sk-act-del:hover  { background:rgba(239,68,68,0.14); transform:translateY(-1px); }

        .sk-overlay { position:fixed; inset:0; background:rgba(10,15,30,0.55); display:flex; align-items:center; justify-content:center; z-index:300; padding:16px; box-sizing:border-box; animation:sk-fadeIn 0.2s ease both; backdrop-filter:blur(6px); }
        .sk-modal { background:var(--sk-card); border-radius:18px; border:1px solid var(--sk-border); box-shadow:0 40px 100px rgba(2,6,23,0.22); width:100%; max-width:620px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; animation:sk-modalSlide 0.3s cubic-bezier(.22,1,.36,1) both; position:relative; }
        .sk-modal-accent { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, var(--sk-purple) 0%, var(--sk-cyan) 100%); animation: sk-pulseRing 3s ease-in-out infinite; z-index:10; }
        .sk-modal-header { display:flex; justify-content:space-between; align-items:flex-start; padding:22px 24px 18px; border-bottom:1px solid var(--sk-border); flex-shrink:0; margin-top:4px; }
        .sk-modal-header h3 { font-size:18px; font-weight:900; margin:0 0 3px; }
        .sk-modal-sub { font-size:12px; color:var(--sk-muted); margin:0; font-family:'IBM Plex Mono',monospace; }
        .sk-modal-x { border:none; background:rgba(15,23,42,0.06); color:var(--sk-text); width:30px; height:30px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.15s, transform 0.15s; }
        .sk-modal-x:hover { background:rgba(15,23,42,0.12); transform:rotate(90deg); }
        .sk-modal-body { padding:22px 24px; overflow-y:auto; display:flex; flex-direction:column; gap:14px; flex:1; }
        .sk-modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--sk-border); flex-shrink:0; }

        .sk-mrow  { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
        .sk-m2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .sk-mfield { display:flex; flex-direction:column; gap:5px; }
        .sk-mfield-grow   { flex:1; min-width:150px; }
        .sk-mfield-toggle { flex-shrink:0; }
        .sk-mfield label { font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800; color:var(--sk-muted); text-transform:uppercase; letter-spacing:0.06em; display:flex; align-items:center; gap:4px; }
        .sk-req { color:var(--sk-red); }

        .sk-mfield input:not([type=checkbox]):not([type=color]):not([type=range]), .sk-mfield textarea, .sk-mfield select { width:100%; padding:9px 13px; border-radius:10px; border:1px solid var(--sk-border); background:rgba(0,0,0,0.02); font-family:'Inter',sans-serif; font-size:13px; color:var(--sk-text); font-weight:600; transition:all 0.2s ease; box-sizing:border-box; }
        .sk-mfield input:focus, .sk-mfield textarea:focus, .sk-mfield select:focus { outline:none; border-color:var(--sk-purple); background:#fff; box-shadow:0 0 0 3px rgba(62,24,249,0.11); transform:translateY(-1px); }
        .sk-mfield textarea { resize:vertical; }

        .sk-range { width:100%; -webkit-appearance:none; appearance:none; height:5px; border-radius:999px; background:rgba(62,24,249,0.14); outline:none; cursor:pointer; padding:0 !important; border:none !important; box-shadow:none !important; }
        .sk-range::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:var(--rc, var(--sk-purple)); cursor:pointer; box-shadow:0 2px 8px rgba(62,24,249,0.35); transition:transform 0.15s; }
        .sk-range::-webkit-slider-thumb:hover { transform:scale(1.2); }

        .sk-sw { display:inline-flex; align-items:center; cursor:pointer; margin-top:4px; }
        .sk-sw input { display:none; }
        .sk-sw-track { width:40px; height:22px; border-radius:999px; background:rgba(15,23,42,0.12); position:relative; transition:background 0.22s; border:1px solid var(--sk-border); }
        .sk-sw input:checked + .sk-sw-track { background:var(--sk-purple); border-color:var(--sk-purple); }
        .sk-sw-thumb { position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.20); transition:transform 0.22s; }
        .sk-sw input:checked + .sk-sw-track .sk-sw-thumb { transform:translateX(18px); }

        .sk-btn-ghost { background:rgba(15,23,42,0.06); color:var(--sk-text); border:none; padding:9px 16px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; transition:all 0.15s; }
        .sk-btn-ghost:hover { background:rgba(15,23,42,0.11); }
        .sk-btn-save { background:var(--sk-purple); color:#fff; border:none; padding:9px 20px; border-radius:8px; font-weight:800; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-family:'Inter',sans-serif; box-shadow:0 4px 16px rgba(62,24,249,0.28); transition:all 0.22s ease; }
        .sk-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(62,24,249,0.38); }
        .sk-btn-save:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
        .sk-btn-danger { background:rgba(239,68,68,0.10); color:var(--sk-red); border:none; padding:9px 16px; border-radius:8px; font-weight:800; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; transition:all 0.15s; }
        .sk-btn-danger:hover { background:rgba(239,68,68,0.18); }

        .sk-confirm-box { background:var(--sk-card); border-radius:16px; border:1px solid var(--sk-border); box-shadow:0 28px 70px rgba(2,6,23,0.20); padding:32px 28px; text-align:center; max-width:350px; width:100%; animation:sk-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both; }
        .sk-confirm-glyph { font-size:44px; margin-bottom:14px; }
        .sk-confirm-box h3 { font-size:18px; font-weight:900; margin:0 0 8px; }
        .sk-confirm-box p  { color:var(--sk-muted); font-size:13px; margin:0 0 24px; }
        .sk-confirm-row { display:flex; gap:10px; justify-content:center; }

        .sk-spin-sm { width:13px; height:13px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:sk-spin360 0.5s linear infinite; }
        .sk-loading-ring { width:38px; height:38px; border:3px solid rgba(62,24,249,0.18); border-top-color:var(--sk-purple); border-radius:50%; animation:sk-spin360 0.7s linear infinite; }
        .sk-loading { display:flex; flex-direction:column; align-items:center; padding:100px 20px; gap:16px; font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--sk-muted); }
        
        .sk-empty { display:flex; flex-direction:column; align-items:center; padding:80px 20px; gap:14px; text-align:center; }
        .sk-empty-glyph { font-size:52px; }
        .sk-empty-title { font-size:20px; font-weight:900; margin:0; }
        .sk-empty-sub   { color:var(--sk-muted); font-size:14px; margin:0; max-width:300px; }

        @media (max-width:640px) {
          .sk-m2col { grid-template-columns:1fr; }
          .sk-grid  { grid-template-columns:1fr; }
          .sk-modal { max-height:96vh; }
          .sk-modal-body { padding:16px; }
          .sk-modal-header, .sk-modal-footer { padding:14px 16px; }
          .sk-filters { flex-direction:column; align-items:stretch; }
          .sk-search-wrap { max-width:100%; }
        }
      `}</style>
    </div>
  );
};

export default ProjectManagement;