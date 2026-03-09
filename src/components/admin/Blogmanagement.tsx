import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Edit3, Trash2, X, Save, FileText, Tag,
  Search, Award, Image as ImageIcon,
  User, Calendar, Eye,
} from "lucide-react";
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from "../../redux/services/blogApi";
import type {
  Blog,
  BlogCreateRequest,
  BlogUpdateRequest,
} from "../../redux/services/blogApi";

/* ─────────────────────────────────────────
   FORM TYPES & HELPERS
───────────────────────────────────────── */
interface FormState {
  title: string;
  content: string;
  summary: string;
  cover_image: string;
  author: string;
  tags: string;
  featured: boolean;
}

const BLANK: FormState = {
  title: "",
  content: "",
  summary: "",
  cover_image: "",
  author: "",
  tags: "",
  featured: false,
};

const toForm = (b?: Blog | null): FormState => ({
  title:       b?.title ?? "",
  content:     b?.content ?? "",
  summary:     b?.summary ?? "",
  cover_image: b?.cover_image ?? "",
  author:      b?.author ?? "",
  tags:        (b?.tags ?? []).join(", "),
  featured:    b?.featured ?? false,
});

const toPayload = (f: FormState): BlogCreateRequest => ({
  title:       f.title.trim(),
  content:     f.content.trim(),
  summary:     f.summary.trim() || undefined,
  cover_image: f.cover_image.trim() || undefined,
  author:      f.author.trim() || undefined,
  tags:        f.tags.split(",").map(t => t.trim()).filter(Boolean),
  featured:    f.featured,
});

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const BlogManagement = () => {
  const { data: blogs = [], isLoading, refetch } = useGetBlogsQuery({ limit: 100 });
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Blog | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(BLANK);
  const [search,     setSearch]     = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");

  /* Aurora cursor effect on cards */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".bl-aurora-card").forEach(card => {
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
    total: blogs.length,
    featured: blogs.filter(b => b.featured).length,
    recent: blogs.filter(b => {
      if (!b.created_at) return false;
      const days = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length,
    avgWordCount: blogs.length > 0
      ? Math.round(blogs.reduce((sum, b) => sum + b.content.split(/\s+/).length, 0) / blogs.length)
      : 0,
  }), [blogs]);

  /* Filter blogs */
  const filtered = useMemo(() => blogs.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.title.toLowerCase().includes(q) ||
      b.content.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.tags?.some(t => t.toLowerCase().includes(q));
    
    const matchFeatured = filterFeatured === "all" ||
      (filterFeatured === "featured" && b.featured) ||
      (filterFeatured === "regular" && !b.featured);
    
    return matchSearch && matchFeatured;
  }), [blogs, search, filterFeatured]);

  /* Modal helpers */
  const openCreate = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
  const openEdit   = (b: Blog) => { setEditTarget(b); setForm(toForm(b)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const fc = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  /* Save */
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.content.trim()) { toast.error("Content is required."); return; }
    const payload = toPayload(form);
    try {
      if (editTarget) {
        await updateBlog({ blogId: editTarget.blog_id, body: payload as BlogUpdateRequest }).unwrap();
        toast.success("Blog updated!");
      } else {
        await createBlog(payload).unwrap();
        toast.success("Blog created!");
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
      await deleteBlog(deleteId).unwrap();
      toast.success("Blog deleted!");
      setDeleteId(null); refetch();
    } catch {
      toast.error("Failed to delete blog.");
    }
  };

  /* Loading */
  if (isLoading) {
    return (
      <div className="bl-loading">
        <div className="bl-loading-ring" />
        <span>Loading blogs…</span>
      </div>
    );
  }

  return (
    <div className="bl-wrapper">
      {/* ══════════════ PAGE HEADER ══════════════ */}
      <div className="bl-page-header">
        <div>
          <h2>Blog <span className="bl-gradient-text">Management</span></h2>
          <p className="bl-subtitle">Create and manage your blog posts</p>
        </div>
        <button className="bl-btn-primary" onClick={openCreate}>
          <Plus size={18} strokeWidth={2.5} />
          New Blog Post
        </button>
      </div>

      {/* ══════════════ STATS ROW ══════════════ */}
      <div className="bl-stats-row">
        <div className="bl-stat-card bl-aurora-card">
          <div className="bl-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="bl-stat-val">{stats.total}</div>
            <div className="bl-stat-label">Total Blogs</div>
          </div>
        </div>
        <div className="bl-stat-card bl-aurora-card">
          <div className="bl-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <Award size={20} />
          </div>
          <div>
            <div className="bl-stat-val">{stats.featured}</div>
            <div className="bl-stat-label">Featured</div>
          </div>
        </div>
        <div className="bl-stat-card bl-aurora-card">
          <div className="bl-stat-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className="bl-stat-val">{stats.recent}</div>
            <div className="bl-stat-label">Recent (30 days)</div>
          </div>
        </div>
        <div className="bl-stat-card bl-aurora-card">
          <div className="bl-stat-icon" style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
            <Eye size={20} />
          </div>
          <div>
            <div className="bl-stat-val">{stats.avgWordCount}</div>
            <div className="bl-stat-label">Avg Words</div>
          </div>
        </div>
      </div>

      {/* ══════════════ FILTERS ══════════════ */}
      <div className="bl-filters">
        <div className="bl-search-wrap">
          <Search size={18} className="bl-search-icon" />
          <input
            type="text"
            placeholder="Search by title, content, author, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bl-search-input"
          />
        </div>
        <div className="bl-filter-chips">
          {["all", "featured", "regular"].map(f => (
            <button
              key={f}
              className={`bl-filter-chip ${filterFeatured === f ? "bl-filter-chip-active" : ""}`}
              onClick={() => setFilterFeatured(f as any)}
            >
              {f === "all" ? "All" : f === "featured" ? "Featured" : "Regular"}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ BLOGS GRID ══════════════ */}
      {filtered.length === 0 ? (
        <div className="bl-empty">
          <div className="bl-empty-glyph">📝</div>
          <h3 className="bl-empty-title">No blog posts found</h3>
          <p className="bl-empty-sub">
            {search || filterFeatured !== "all"
              ? "Try adjusting your filters"
              : "Click 'New Blog Post' to create your first one"}
          </p>
        </div>
      ) : (
        <div className="bl-grid">
          {filtered.map((blog) => (
            <div key={blog.blog_id} className="bl-card bl-aurora-card">
              {/* Cover Image */}
              {blog.cover_image && (
                <div className="bl-card-cover">
                  <img src={blog.cover_image} alt={blog.title} />
                </div>
              )}

              {/* Content */}
              <div className="bl-card-content">
                <div className="bl-card-header">
                  <h3 className="bl-card-title">{blog.title}</h3>
                  <div className="bl-card-actions">
                    <button
                      className="bl-icon-btn"
                      onClick={() => openEdit(blog)}
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="bl-icon-btn bl-icon-btn-danger"
                      onClick={() => setDeleteId(blog.blog_id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {blog.summary && (
                  <p className="bl-card-summary">{blog.summary}</p>
                )}

                {/* Meta */}
                <div className="bl-card-meta">
                  {blog.author && (
                    <span className="bl-meta-item">
                      <User size={13} />
                      {blog.author}
                    </span>
                  )}
                  {blog.created_at && (
                    <span className="bl-meta-item">
                      <Calendar size={13} />
                      {new Date(blog.created_at).toLocaleDateString()}
                    </span>
                  )}
                  <span className="bl-meta-item">
                    <FileText size={13} />
                    {blog.content.split(/\s+/).length} words
                  </span>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="bl-card-tags">
                    {blog.tags.map((tag, i) => (
                      <span key={i} className="bl-tag">
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Featured Badge */}
                {blog.featured && (
                  <div className="bl-featured-badge">
                    <Award size={12} />
                    Featured
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ CREATE/EDIT MODAL ══════════════ */}
      {modalOpen && (
        <div className="bl-modal-overlay" onClick={closeModal}>
          <div className="bl-modal" onClick={e => e.stopPropagation()}>
            <div className="bl-modal-header">
              <h3>{editTarget ? "Edit Blog Post" : "Create New Blog Post"}</h3>
              <button className="bl-modal-x" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="bl-modal-body">
              {/* Title */}
              <div className="bl-mfield">
                <label>
                  <FileText size={12} />
                  Blog Title <span className="bl-req">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={fc("title")}
                  placeholder="Enter blog title..."
                />
              </div>

              {/* Summary */}
              <div className="bl-mfield">
                <label>Summary / Excerpt</label>
                <textarea
                  value={form.summary}
                  onChange={fc("summary")}
                  rows={2}
                  placeholder="Brief description of the blog post..."
                />
              </div>

              {/* Content */}
              <div className="bl-mfield">
                <label>
                  Content <span className="bl-req">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={fc("content")}
                  rows={10}
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Author & Cover Image */}
              <div className="bl-m2col">
                <div className="bl-mfield">
                  <label>
                    <User size={12} />
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={fc("author")}
                    placeholder="John Doe"
                  />
                </div>
                <div className="bl-mfield">
                  <label>
                    <ImageIcon size={12} />
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={form.cover_image}
                    onChange={fc("cover_image")}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bl-mfield">
                <label>
                  <Tag size={12} />
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={fc("tags")}
                  placeholder="React, TypeScript, Web Development"
                />
              </div>

              {/* Featured Toggle */}
              <div className="bl-mfield bl-mfield-toggle">
                <label style={{ marginBottom: 6 }}>
                  <Award size={12} />
                  Featured Blog Post
                </label>
                <label className="bl-sw">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={fc("featured")}
                  />
                  <div className="bl-sw-track">
                    <div className="bl-sw-thumb" />
                  </div>
                </label>
              </div>
            </div>
            <div className="bl-modal-footer">
              <button className="bl-btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="bl-btn-save"
                onClick={handleSave}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="bl-spin-sm" />
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
        <div className="bl-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="bl-confirm-box" onClick={e => e.stopPropagation()}>
            <div className="bl-confirm-glyph">⚠️</div>
            <h3>Delete Blog Post?</h3>
            <p>This action cannot be undone. The blog post will be permanently removed.</p>
            <div className="bl-confirm-row">
              <button className="bl-btn-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="bl-btn-danger" onClick={handleDelete}>
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

        :root {
          --bl-bg: #F7F8FC; --bl-card: #FFFFFF; --bl-border: rgba(15,23,42,0.10);
          --bl-text: #0F172A; --bl-muted: rgba(15,23,42,0.55); --bl-purple: #6366f1; --bl-red: #ef4444;
        }

        @keyframes bl-fadeDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bl-fadeUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes bl-modalSlide { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes bl-spin360  { to{transform:rotate(360deg)} }

        .bl-wrapper {
          width:100%; max-width:1300px; margin:0 auto; padding:32px 24px 64px;
          box-sizing:border-box; font-family:'Inter',sans-serif; color:var(--bl-text);
          background: radial-gradient(60% 70% at 20% 25%, rgba(99,102,241,0.06) 0%, transparent 60%), var(--bl-bg);
        }

        .bl-page-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          margin-bottom:28px; gap:20px; flex-wrap:wrap;
          animation:bl-fadeDown 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        .bl-page-header h2 { font-size:clamp(26px,5vw,36px); font-weight:900; letter-spacing:-0.03em; margin:0 0 6px; line-height:1.1; }
        .bl-gradient-text { background:linear-gradient(90deg, #6366f1 0%, #a855f7 110%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .bl-subtitle { color:var(--bl-muted); font-size:15px; margin:0; font-weight:500; }

        .bl-btn-primary {
          background:#000; color:#fff; border:none; padding:11px 20px; border-radius:10px;
          font-weight:800; font-size:14px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif; box-shadow:0 4px 16px rgba(0,0,0,0.14);
          transition:all 0.22s cubic-bezier(.22,1,.36,1);
        }
        .bl-btn-primary:hover { background:var(--bl-purple); transform:translateY(-3px); box-shadow:0 8px 24px rgba(99,102,241,0.35); }

        .bl-stats-row {
          display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:28px;
          animation:bl-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; animation-delay:0.08s;
        }
        .bl-stat-card {
          background:var(--bl-card); border-radius:14px; border:1px solid var(--bl-border);
          padding:20px; box-shadow:0 4px 14px rgba(2,6,23,0.04); display:flex; align-items:center; gap:14px;
          position:relative; overflow:hidden; transition:all 0.22s ease;
        }
        .bl-stat-card:hover { transform:translateY(-3px); box-shadow:0 8px 22px rgba(2,6,23,0.08); }

        .bl-aurora-card::before {
          content:""; position:absolute; inset:0; border-radius:inherit; padding:2px;
          background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,0.14), transparent 40%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; z-index:1;
        }
        .bl-aurora-card::after {
          content:""; position:absolute; inset:0;
          background:radial-gradient(800px circle at var(--mx,50%) var(--my,50%), rgba(168,85,247,0.03), transparent 40%);
          pointer-events:none; z-index:0;
        }

        .bl-stat-icon { width:46px; height:46px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; border:1px solid rgba(99,102,241,0.18); }
        .bl-stat-val { font-size:26px; font-weight:900; letter-spacing:-0.02em; margin:0 0 2px; color:var(--bl-text); line-height:1; }
        .bl-stat-label { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800; color:var(--bl-muted); text-transform:uppercase; letter-spacing:0.05em; }

        .bl-filters {
          display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; gap:16px; flex-wrap:wrap;
          animation:bl-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; animation-delay:0.12s;
        }
        .bl-search-wrap { position:relative; max-width:400px; flex:1; }
        .bl-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:var(--bl-muted); pointer-events:none; }
        .bl-search-input {
          width:100%; padding:11px 14px 11px 42px; border-radius:10px; border:1px solid var(--bl-border);
          background:var(--bl-card); font-family:'Inter',sans-serif; font-size:14px; color:var(--bl-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .bl-search-input:focus { outline:none; border-color:var(--bl-purple); box-shadow:0 0 0 3px rgba(99,102,241,0.11); transform:translateY(-1px); }
        .bl-search-input::placeholder { color:var(--bl-muted); font-weight:500; }

        .bl-filter-chips { display:flex; gap:8px; flex-wrap:wrap; }
        .bl-filter-chip {
          background:rgba(15,23,42,0.04); border:1px solid var(--bl-border); color:var(--bl-text);
          padding:8px 16px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;
          font-family:'Inter',sans-serif; transition:all 0.2s ease;
        }
        .bl-filter-chip:hover { background:rgba(15,23,42,0.08); border-color:rgba(99,102,241,0.3); }
        .bl-filter-chip-active { background:var(--bl-purple); color:#fff; border-color:var(--bl-purple); }

        .bl-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:20px;
          animation:bl-fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; animation-delay:0.16s;
        }
        .bl-card {
          background:var(--bl-card); border-radius:14px; border:1px solid var(--bl-border);
          box-shadow:0 4px 14px rgba(2,6,23,0.04); position:relative; overflow:hidden;
          display:flex; flex-direction:column; transition:all 0.22s ease;
        }
        .bl-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px rgba(2,6,23,0.10); }

        .bl-card-cover {
          width:100%; height:180px; overflow:hidden; background:linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          position:relative; z-index:2;
        }
        .bl-card-cover img { width:100%; height:100%; object-fit:cover; display:block; }

        .bl-card-content { padding:20px; display:flex; flex-direction:column; gap:12px; position:relative; z-index:2; flex:1; }

        .bl-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .bl-card-title { font-size:18px; font-weight:800; margin:0; color:var(--bl-text); line-height:1.3; flex:1; }
        .bl-card-actions { display:flex; gap:6px; flex-shrink:0; }

        .bl-icon-btn {
          background:rgba(15,23,42,0.04); border:1px solid transparent; border-radius:8px; padding:7px;
          color:var(--bl-muted); cursor:pointer; display:flex; align-items:center; justify-content:center;
          transition:all 0.2s;
        }
        .bl-icon-btn:hover {
          background:rgba(99,102,241,0.10); border-color:rgba(99,102,241,0.25);
          color:var(--bl-purple); transform:translateY(-2px);
        }
        .bl-icon-btn-danger:hover { background:rgba(239,68,68,0.10); border-color:rgba(239,68,68,0.25); color:var(--bl-red); }

        .bl-card-summary { font-size:14px; line-height:1.6; color:var(--bl-muted); margin:0; }

        .bl-card-meta {
          display:flex; flex-wrap:wrap; gap:12px; padding-top:8px; border-top:1px solid var(--bl-border);
        }
        .bl-meta-item {
          font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--bl-muted);
          display:flex; align-items:center; gap:5px; font-weight:600;
        }

        .bl-card-tags { display:flex; flex-wrap:wrap; gap:6px; }
        .bl-tag {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          background:rgba(99,102,241,0.08); color:var(--bl-purple); padding:4px 9px; border-radius:5px;
          display:inline-flex; align-items:center; gap:4px; border:1px solid rgba(99,102,241,0.15);
        }

        .bl-featured-badge {
          position:absolute; top:12px; right:12px; z-index:3;
          background:rgba(245,158,11,0.95); color:#fff; padding:5px 10px; border-radius:6px;
          font-size:11px; font-weight:800; display:flex; align-items:center; gap:5px;
          box-shadow:0 3px 10px rgba(245,158,11,0.4); backdrop-filter:blur(8px);
        }

        .bl-modal-overlay {
          position:fixed; inset:0; background:rgba(2,6,23,0.60); backdrop-filter:blur(8px); z-index:9999;
          display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;
          animation:bl-fadeDown 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .bl-modal {
          background:var(--bl-card); border-radius:18px; border:1px solid var(--bl-border);
          box-shadow:0 32px 80px rgba(2,6,23,0.24); width:100%; max-width:680px; max-height:92vh;
          display:flex; flex-direction:column; animation:bl-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both;
          animation-delay:0.08s;
        }

        .bl-modal-header {
          display:flex; justify-content:space-between; align-items:center; padding:22px 24px;
          border-bottom:1px solid var(--bl-border); flex-shrink:0;
        }
        .bl-modal-header h3 { font-size:20px; font-weight:900; margin:0; }
        .bl-modal-x {
          background:transparent; border:none; padding:6px; border-radius:8px; cursor:pointer;
          display:flex; color:var(--bl-muted); transition:background 0.15s, transform 0.15s;
        }
        .bl-modal-x:hover { background:rgba(15,23,42,0.12); transform:rotate(90deg); }

        .bl-modal-body { padding:22px 24px; overflow-y:auto; display:flex; flex-direction:column; gap:16px; flex:1; }
        .bl-modal-footer {
          display:flex; justify-content:flex-end; gap:10px; padding:16px 24px;
          border-top:1px solid var(--bl-border); flex-shrink:0;
        }

        .bl-m2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .bl-mfield { display:flex; flex-direction:column; gap:5px; }
        .bl-mfield-toggle { flex-shrink:0; }

        .bl-mfield label {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800; color:var(--bl-muted);
          text-transform:uppercase; letter-spacing:0.06em; display:flex; align-items:center; gap:4px;
        }
        .bl-req { color:var(--bl-red); }

        .bl-mfield input:not([type=checkbox]), .bl-mfield textarea {
          width:100%; padding:11px 14px; border-radius:10px; border:1px solid var(--bl-border);
          background:rgba(0,0,0,0.02); font-family:'Inter',sans-serif; font-size:14px;
          color:var(--bl-text); font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .bl-mfield input:focus, .bl-mfield textarea:focus {
          outline:none; border-color:var(--bl-purple); background:#fff;
          box-shadow:0 0 0 3px rgba(99,102,241,0.11); transform:translateY(-1px);
        }
        .bl-mfield textarea { resize:vertical; line-height:1.5; }

        .bl-sw { display:inline-flex; align-items:center; cursor:pointer; margin-top:4px; }
        .bl-sw input { display:none; }
        .bl-sw-track {
          width:44px; height:24px; border-radius:999px; background:rgba(15,23,42,0.12); position:relative;
          transition:background 0.22s cubic-bezier(.22,1,.36,1); border:1px solid var(--bl-border);
        }
        .bl-sw input:checked + .bl-sw-track { background:var(--bl-purple); border-color:var(--bl-purple); }
        .bl-sw-thumb {
          position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.20); transition:transform 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        .bl-sw input:checked + .bl-sw-track .bl-sw-thumb { transform:translateX(20px); }

        .bl-btn-ghost {
          background:rgba(15,23,42,0.06); color:var(--bl-text); border:none; padding:10px 18px;
          border-radius:8px; font-weight:700; font-size:14px; cursor:pointer; display:inline-flex;
          align-items:center; gap:6px; font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .bl-btn-ghost:hover { background:rgba(15,23,42,0.11); }

        .bl-btn-save {
          background:var(--bl-purple); color:#fff; border:none; padding:10px 22px; border-radius:8px;
          font-weight:800; font-size:14px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif; box-shadow:0 4px 16px rgba(99,102,241,0.28);
          transition:all 0.22s ease;
        }
        .bl-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,0.38); }
        .bl-btn-save:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

        .bl-btn-danger {
          background:rgba(239,68,68,0.10); color:var(--bl-red); border:none; padding:10px 18px;
          border-radius:8px; font-weight:800; font-size:14px; cursor:pointer; display:inline-flex;
          align-items:center; gap:6px; font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .bl-btn-danger:hover { background:rgba(239,68,68,0.18); }

        .bl-confirm-box {
          background:var(--bl-card); border-radius:16px; border:1px solid var(--bl-border);
          box-shadow:0 28px 70px rgba(2,6,23,0.20); padding:32px 28px; text-align:center;
          max-width:380px; width:100%; animation:bl-modalSlide 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .bl-confirm-glyph { font-size:48px; margin-bottom:14px; }
        .bl-confirm-box h3 { font-size:19px; font-weight:900; margin:0 0 8px; }
        .bl-confirm-box p { color:var(--bl-muted); font-size:14px; margin:0 0 24px; line-height:1.5; }
        .bl-confirm-row { display:flex; gap:10px; justify-content:center; }

        .bl-spin-sm {
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff;
          border-radius:50%; animation:bl-spin360 0.5s linear infinite;
        }
        .bl-loading-ring {
          width:40px; height:40px; border:3px solid rgba(99,102,241,0.18); border-top-color:var(--bl-purple);
          border-radius:50%; animation:bl-spin360 0.7s linear infinite;
        }
        .bl-loading {
          display:flex; flex-direction:column; align-items:center; padding:100px 20px; gap:16px;
          font-family:'IBM Plex Mono',monospace; font-size:14px; color:var(--bl-muted);
        }

        .bl-empty {
          display:flex; flex-direction:column; align-items:center; padding:80px 20px; gap:14px; text-align:center;
        }
        .bl-empty-glyph { font-size:56px; }
        .bl-empty-title { font-size:22px; font-weight:900; margin:0; }
        .bl-empty-sub { color:var(--bl-muted); font-size:15px; margin:0; max-width:320px; }

        @media (max-width:1024px) {
          .bl-stats-row { grid-template-columns:repeat(2,1fr); }
          .bl-grid { grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); }
        }
        @media (max-width:640px) {
          .bl-wrapper { padding:20px 16px 48px; }
          .bl-m2col { grid-template-columns:1fr; }
          .bl-grid { grid-template-columns:1fr; }
          .bl-stats-row { grid-template-columns:1fr; }
          .bl-modal { max-height:96vh; }
          .bl-modal-body { padding:16px; }
          .bl-modal-header, .bl-modal-footer { padding:14px 16px; }
          .bl-filters { flex-direction:column; align-items:stretch; }
          .bl-search-wrap { max-width:100%; }
          .bl-page-header { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
    </div>
  );
};

export default BlogManagement;