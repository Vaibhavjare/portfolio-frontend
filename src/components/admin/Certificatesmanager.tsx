import React, { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus, Edit3, Trash2, X, Save, Star,
  ExternalLink, Award, Search, Calendar, Hash, Building2, Link2
} from "lucide-react";
import {
  useGetCertificatesQuery,
  useCreateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} from "../../redux/services/certificateApi";
import type {
  Certificate,
  CertificateCreateRequest,
  CertificateUpdateRequest,
} from "../../redux/services/certificateApi";

/* ─────────────────────────────────────────
   FORM
───────────────────────────────────────── */
interface FormState {
  name: string;
  description: string;
  organization: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
  certificate_url: string;
  thumbnail_url: string;
  is_featured: boolean;
}

const BLANK: FormState = {
  name: "", description: "", organization: "",
  issue_date: "", expiry_date: "",
  credential_id: "", credential_url: "",
  certificate_url: "", thumbnail_url: "",
  is_featured: false,
};

const toForm = (c?: Certificate | null): FormState => ({
  name:            c?.name ?? "",
  description:     c?.description ?? "",
  organization:    c?.organization ?? "",
  issue_date:      c?.issue_date ? c.issue_date.slice(0, 10) : "",
  expiry_date:     c?.expiry_date ? c.expiry_date.slice(0, 10) : "",
  credential_id:   c?.credential_id ?? "",
  credential_url:  c?.credential_url ?? "",
  certificate_url: c?.certificate_url ?? "",
  thumbnail_url:   c?.thumbnail_url ?? "",
  is_featured:     c?.is_featured ?? false,
});

const clean = (v: string) => v.trim() || undefined;

const toPayload = (f: FormState): CertificateCreateRequest => ({
  name:            f.name.trim(),
  description:     clean(f.description),
  organization:    clean(f.organization),
  issue_date:      clean(f.issue_date),
  expiry_date:     clean(f.expiry_date),
  credential_id:   clean(f.credential_id),
  credential_url:  clean(f.credential_url),
  certificate_url: clean(f.certificate_url),
  thumbnail_url:   clean(f.thumbnail_url),
  is_featured:     f.is_featured,
});

/* ─────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────── */
const formatDate = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const isExpired = (iso?: string) => {
  if (!iso) return false;
  return new Date(iso) < new Date();
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const CertificatesManager = () => {
  const { data: certs = [], isLoading, refetch } = useGetCertificatesQuery({});
  const [createCert, { isLoading: isCreating }] = useCreateCertificateMutation();
  const [updateCert, { isLoading: isUpdating }] = useUpdateCertificateMutation();
  const [deleteCert] = useDeleteCertificateMutation();

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState<Certificate | null>(null);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [form,       setForm]       = useState<FormState>(BLANK);
  const [search,     setSearch]     = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");

  /* Aurora cursor on cards */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>(".cert-aurora").forEach(el => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* Derived */
  const filtered = useMemo(() => certs.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      c.name.toLowerCase().includes(q) ||
      c.organization?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q);
    const matchF =
      filterFeatured === "all" ||
      (filterFeatured === "featured" && c.is_featured) ||
      (filterFeatured === "regular"  && !c.is_featured);
    return matchQ && matchF;
  }), [certs, search, filterFeatured]);

  /* Modal helpers */
  const openCreate = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
  const openEdit   = (c: Certificate) => { setEditTarget(c); setForm(toForm(c)); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const fc = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  /* Save */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Certificate name is required."); return; }
    const payload = toPayload(form);
    try {
      if (editTarget) {
        await updateCert({
          certificateId: editTarget.certificate_id,
          body: payload as CertificateUpdateRequest,
        }).unwrap();
        toast.success("Certificate updated!");
      } else {
        await createCert(payload).unwrap();
        toast.success("Certificate added!");
      }
      closeModal(); refetch();
    } catch (err: any) {
      const d = err?.data?.detail;
      toast.error(Array.isArray(d)
        ? d.map((x: any) => `${x.loc?.slice(-1)[0]}: ${x.msg}`).join(", ")
        : d ?? "Save failed.");
    }
  };

  /* Delete */
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCert(deleteId).unwrap();
      toast.success("Certificate deleted.");
      setDeleteId(null); refetch();
    } catch { toast.error("Delete failed."); }
  };

  if (isLoading) return (
    <div className="cm-loading">
      <div className="cm-ring" />
      <p>Loading certificates…</p>
    </div>
  );

  return (
    <div className="cm-wrapper">

      {/* ══════ HEADER ══════ */}
      <div className="cm-header cm-anim-down">
        <div>
          <h2 className="cm-title">
            Certificates <span className="cm-grad">Manager</span>
          </h2>
          <p className="cm-sub">
            <span className="cm-stat">{certs.length} total</span>
            <span className="cm-dot">·</span>
            <span className="cm-stat cm-stat-gold">{certs.filter(c => c.is_featured).length} featured</span>
            <span className="cm-dot">·</span>
            <span className="cm-stat cm-stat-green">{certs.filter(c => !isExpired(c.expiry_date)).length} valid</span>
          </p>
        </div>
        <button className="cm-btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.5} /> Add Certificate
        </button>
      </div>

      {/* ══════ STATS CARDS ══════ */}
      {certs.length > 0 && (
        <div className="cm-stats cm-anim-up" style={{ animationDelay: "0.06s" }}>
          {[
            { label: "Total",    value: certs.length,                                            icon: "🏆" },
            { label: "Featured", value: certs.filter(c => c.is_featured).length,                 icon: "⭐" },
            { label: "Valid",    value: certs.filter(c => !isExpired(c.expiry_date)).length,      icon: "✅" },
            { label: "Expired",  value: certs.filter(c => isExpired(c.expiry_date)).length,       icon: "⏰" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="cm-stat-card">
              <span className="cm-stat-icon">{icon}</span>
              <span className="cm-stat-val">{value}</span>
              <span className="cm-stat-lbl">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══════ FILTERS ══════ */}
      <div className="cm-filters cm-anim-up" style={{ animationDelay: "0.10s" }}>
        <div className="cm-search-wrap">
          <Search size={13} className="cm-search-ico" />
          <input
            className="cm-search"
            placeholder="Search name, organization…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="cm-search-clear" onClick={() => setSearch("")}><X size={12} /></button>
          )}
        </div>
        <div className="cm-filter-pills">
          {(["all", "featured", "regular"] as const).map((f, i) => (
            <button
              key={f}
              className={`cm-pill${filterFeatured === f ? " cm-pill-active" : ""}`}
              style={{ animationDelay: `${0.12 + i * 0.05}s` }}
              onClick={() => setFilterFeatured(f)}
            >
              {f === "all" ? "All" : f === "featured" ? "⭐ Featured" : "Regular"}
            </button>
          ))}
        </div>
      </div>

      {/* ══════ EMPTY STATE ══════ */}
      {filtered.length === 0 && (
        <div className="cm-empty cm-anim-up">
          <div className="cm-empty-glyph">🎓</div>
          <h3>{search || filterFeatured !== "all" ? "No matching certificates" : "No certificates yet"}</h3>
          <p>{search || filterFeatured !== "all" ? "Try a different search or filter." : "Add your first certificate to showcase your credentials."}</p>
          {!search && filterFeatured === "all" && (
            <button className="cm-btn-primary" onClick={openCreate}><Plus size={14} />Add Certificate</button>
          )}
        </div>
      )}

      {/* ══════ CERTIFICATES GRID ══════ */}
      {filtered.length > 0 && (
        <div className="cm-grid">
          {filtered.map((c, i) => {
            const expired = isExpired(c.expiry_date);
            return (
              <div
                key={c.certificate_id}
                className={`cm-card cert-aurora cm-anim-up${expired ? " cm-card-expired" : ""}`}
                style={{ animationDelay: `${0.08 + i * 0.055}s` }}
              >
                {/* Top gradient bar */}
                <div className={`cm-card-bar${c.is_featured ? " cm-bar-gold" : ""}`} />

                {/* Thumbnail / placeholder */}
                <div className="cm-thumb">
                  {c.thumbnail_url ? (
                    <img src={c.thumbnail_url} alt={c.name} />
                  ) : (
                    <div className="cm-thumb-placeholder">
                      <Award size={32} />
                    </div>
                  )}
                  {c.is_featured && (
                    <span className="cm-badge-featured"><Star size={10} fill="currentColor" />Featured</span>
                  )}
                  {expired && c.expiry_date && (
                    <span className="cm-badge-expired">Expired</span>
                  )}
                  {!expired && c.expiry_date && (
                    <span className="cm-badge-valid">Valid</span>
                  )}
                </div>

                {/* Body */}
                <div className="cm-card-body">
                  <h3 className="cm-card-name">{c.name}</h3>
                  {c.organization && (
                    <p className="cm-card-org"><Building2 size={12} />{c.organization}</p>
                  )}
                  {c.description && (
                    <p className="cm-card-desc">{c.description}</p>
                  )}

                  {/* Dates */}
                  <div className="cm-dates">
                    {c.issue_date && (
                      <div className="cm-date-item">
                        <Calendar size={11} />
                        <span className="cm-date-lbl">Issued</span>
                        <span className="cm-date-val">{formatDate(c.issue_date)}</span>
                      </div>
                    )}
                    {c.expiry_date && (
                      <div className={`cm-date-item${expired ? " cm-date-expired" : ""}`}>
                        <Calendar size={11} />
                        <span className="cm-date-lbl">{expired ? "Expired" : "Expires"}</span>
                        <span className="cm-date-val">{formatDate(c.expiry_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Credential ID */}
                  {c.credential_id && (
                    <div className="cm-cred-id">
                      <Hash size={11} />
                      <span>{c.credential_id}</span>
                    </div>
                  )}

                  {/* Links */}
                  <div className="cm-links">
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" className="cm-link cm-link-primary">
                        <ExternalLink size={12} />Verify
                      </a>
                    )}
                    {c.certificate_url && (
                      <a href={c.certificate_url} target="_blank" rel="noreferrer" className="cm-link cm-link-ghost">
                        <Link2 size={12} />Certificate
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="cm-card-actions">
                  <button className="cm-act-edit" onClick={() => openEdit(c)}><Edit3 size={13} />Edit</button>
                  <button className="cm-act-del"  onClick={() => setDeleteId(c.certificate_id)}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL
      ══════════════════════════════════════════ */}
      {modalOpen && (
        <div className="cm-overlay" onClick={closeModal}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-accent" />

            {/* Header */}
            <div className="cm-modal-header">
              <div>
                <h3>{editTarget ? "Edit Certificate" : "Add Certificate"}</h3>
                <p className="cm-modal-sub">
                  {editTarget ? `Editing: ${editTarget.name}` : "Add a new credential to your portfolio"}
                </p>
              </div>
              <button className="cm-modal-x" onClick={closeModal}><X size={16} /></button>
            </div>

            {/* Body */}
            <div className="cm-modal-body">

              {/* Name + Featured */}
              <div className="cm-mrow">
                <div className="cm-mfield cm-mfield-grow">
                  <label>Certificate Name <span className="cm-req">*</span></label>
                  <input value={form.name} onChange={fc("name")} placeholder="AWS Solutions Architect, React Developer…" />
                </div>
                <div className="cm-mfield cm-mfield-toggle">
                  <label>Featured</label>
                  <label className="cm-sw">
                    <input type="checkbox" checked={form.is_featured} onChange={fc("is_featured")} />
                    <span className="cm-sw-track"><span className="cm-sw-thumb" /></span>
                  </label>
                </div>
              </div>

              {/* Organization + Credential ID */}
              <div className="cm-m2col">
                <div className="cm-mfield">
                  <label><Building2 size={11} />Organization / Issuer</label>
                  <input value={form.organization} onChange={fc("organization")} placeholder="Amazon, Google, Udemy…" />
                </div>
                <div className="cm-mfield">
                  <label><Hash size={11} />Credential ID</label>
                  <input value={form.credential_id} onChange={fc("credential_id")} placeholder="ABC-12345-XYZ" />
                </div>
              </div>

              {/* Description */}
              <div className="cm-mfield">
                <label>Description</label>
                <textarea value={form.description} onChange={fc("description")} rows={2} placeholder="What this certificate covers…" />
              </div>

              {/* Dates */}
              <div className="cm-m2col">
                <div className="cm-mfield">
                  <label><Calendar size={11} />Issue Date</label>
                  <input type="date" value={form.issue_date} onChange={fc("issue_date")} />
                </div>
                <div className="cm-mfield">
                  <label><Calendar size={11} />Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={fc("expiry_date")} />
                </div>
              </div>

              {/* URLs */}
              <div className="cm-field-group-label"><Link2 size={13} />Links & Media</div>
              <div className="cm-mfield">
                <label><ExternalLink size={11} />Credential / Verify URL</label>
                <input value={form.credential_url} onChange={fc("credential_url")} placeholder="https://verify.issuer.com/…" />
              </div>
              <div className="cm-m2col">
                <div className="cm-mfield">
                  <label><Link2 size={11} />Certificate File URL</label>
                  <input value={form.certificate_url} onChange={fc("certificate_url")} placeholder="https://…/certificate.pdf" />
                </div>
                <div className="cm-mfield">
                  <label>Thumbnail / Badge URL</label>
                  <input value={form.thumbnail_url} onChange={fc("thumbnail_url")} placeholder="https://…/badge.png" />
                </div>
              </div>

              {/* Live preview */}
              {(form.name || form.organization) && (
                <div className="cm-preview">
                  <div className="cm-preview-left">
                    <div className="cm-preview-icon">
                      {form.thumbnail_url
                        ? <img src={form.thumbnail_url} alt="" />
                        : <Award size={20} />
                      }
                    </div>
                    <div>
                      <p className="cm-preview-name">{form.name || "Certificate Name"}</p>
                      <p className="cm-preview-org">{form.organization || "Organization"}</p>
                    </div>
                  </div>
                  <div className="cm-preview-right">
                    {form.issue_date && <span className="cm-preview-date">{formatDate(form.issue_date)}</span>}
                    {form.is_featured && <span className="cm-preview-feat"><Star size={10} fill="currentColor" />Featured</span>}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="cm-modal-footer">
              <button className="cm-btn-ghost" onClick={closeModal}><X size={13} />Cancel</button>
              <button className="cm-btn-save" onClick={handleSave} disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? <span className="cm-spin" /> : <Save size={13} />}
                {editTarget ? "Save Changes" : "Add Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ DELETE CONFIRM ══════ */}
      {deleteId && (
        <div className="cm-overlay" onClick={() => setDeleteId(null)}>
          <div className="cm-confirm" onClick={e => e.stopPropagation()}>
            <div className="cm-confirm-icon">🗑️</div>
            <h3>Delete Certificate?</h3>
            <p>This action cannot be undone.</p>
            <div className="cm-confirm-row">
              <button className="cm-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="cm-btn-danger" onClick={handleDelete}><Trash2 size={13} />Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;800&family=Inter:wght@400;600;800;900&display=swap');

        :root {
          --cm-bg:     #F7F8FC;
          --cm-card:   #FFFFFF;
          --cm-border: rgba(15,23,42,0.09);
          --cm-text:   #0F172A;
          --cm-muted:  rgba(15,23,42,0.50);
          --cm-purple: #3E18F9;
          --cm-cyan:   #37D7FA;
          --cm-gold:   #f59e0b;
          --cm-green:  #22c55e;
          --cm-red:    #ef4444;
        }

        /* ── Keyframes ── */
        @keyframes cm-down    { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cm-up      { from{opacity:0;transform:translateY(22px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes cm-fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes cm-modal   { from{opacity:0;transform:translateY(26px) scale(0.97)} to{opacity:1;transform:none} }
        @keyframes cm-pill    { from{opacity:0;transform:scale(0.8) translateX(-6px)} to{opacity:1;transform:none} }
        @keyframes cm-spin360 { to{transform:rotate(360deg)} }
        @keyframes cm-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes cm-pulse   { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes cm-pop     {
          0%  {opacity:0;transform:scale(0.78) translateY(10px)}
          70% {transform:scale(1.03)}
          100%{opacity:1;transform:scale(1) translateY(0)}
        }

        .cm-anim-down { animation: cm-down 0.50s cubic-bezier(.22,1,.36,1) both; }
        .cm-anim-up   { opacity:0; animation: cm-up 0.50s cubic-bezier(.22,1,.36,1) both; }

        /* ── Wrapper ── */
        .cm-wrapper {
          width:100%; max-width:1200px; margin:0 auto;
          padding:0 0 60px; box-sizing:border-box;
          font-family:'Inter',sans-serif; color:var(--cm-text);
        }

        /* ── Header ── */
        .cm-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          margin-bottom:24px; flex-wrap:wrap; gap:16px;
        }
        .cm-title {
          font-size:clamp(24px,4vw,34px); font-weight:900;
          letter-spacing:-0.035em; margin:0 0 6px; line-height:1.1;
        }
        .cm-grad {
          background:linear-gradient(90deg, var(--cm-purple) 0%, var(--cm-cyan) 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .cm-sub {
          display:flex; align-items:center; gap:8px; flex-wrap:wrap;
          font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--cm-muted);
        }
        .cm-stat       { font-weight:700; color:var(--cm-text); }
        .cm-stat-gold  { color:var(--cm-gold); }
        .cm-stat-green { color:var(--cm-green); }
        .cm-dot        { color:var(--cm-border); }

        /* ── Primary button ── */
        .cm-btn-primary {
          background:#0F172A; color:#fff; border:none;
          padding:11px 22px; border-radius:999px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif; white-space:nowrap;
          transition:all 0.22s cubic-bezier(.22,1,.36,1);
          box-shadow:0 4px 16px rgba(15,23,42,0.15);
        }
        .cm-btn-primary:hover {
          background:var(--cm-purple);
          transform:translateY(-2px) scale(1.02);
          box-shadow:0 8px 24px rgba(62,24,249,0.30);
        }
        .cm-btn-primary:active { transform:scale(0.97); }

        /* ── Stats row ── */
        .cm-stats {
          display:grid; grid-template-columns:repeat(4,1fr); gap:12px;
          margin-bottom:24px;
        }
        .cm-stat-card {
          background:var(--cm-card); border:1px solid var(--cm-border); border-radius:14px;
          padding:16px 18px; display:flex; flex-direction:column; gap:4px; align-items:flex-start;
          box-shadow:0 4px 12px rgba(2,6,23,0.04);
          transition:transform 0.2s ease, box-shadow 0.2s ease;
          animation: cm-pop 0.4s cubic-bezier(.34,1.56,.64,1) both;
        }
        .cm-stat-card:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(2,6,23,0.09); }
        .cm-stat-icon { font-size:22px; margin-bottom:4px; }
        .cm-stat-val {
          font-size:26px; font-weight:900; letter-spacing:-0.03em;
          background:linear-gradient(90deg, var(--cm-purple), var(--cm-cyan));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .cm-stat-lbl {
          font-family:'IBM Plex Mono',monospace; font-size:10px;
          font-weight:700; color:var(--cm-muted); text-transform:uppercase; letter-spacing:0.06em;
        }

        /* ── Filters ── */
        .cm-filters {
          display:flex; flex-wrap:wrap; gap:12px; align-items:center;
          margin-bottom:24px;
        }
        .cm-search-wrap { position:relative; flex:1; min-width:200px; max-width:320px; }
        .cm-search-ico {
          position:absolute; left:13px; top:50%; transform:translateY(-50%);
          color:var(--cm-muted); pointer-events:none;
        }
        .cm-search {
          width:100%; padding:10px 36px 10px 36px; border-radius:999px;
          border:1px solid var(--cm-border); background:#fff;
          font-family:'Inter',sans-serif; font-size:13px; color:var(--cm-text);
          font-weight:500; transition:all 0.2s ease; box-sizing:border-box;
        }
        .cm-search:focus {
          outline:none; border-color:var(--cm-purple);
          box-shadow:0 0 0 3px rgba(62,24,249,0.10);
        }
        .cm-search-clear {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          border:none; background:rgba(15,23,42,0.08); color:var(--cm-muted);
          width:18px; height:18px; border-radius:50%; cursor:pointer;
          display:flex; align-items:center; justify-content:center; padding:0;
          transition:background 0.15s;
        }
        .cm-search-clear:hover { background:rgba(15,23,42,0.14); }

        .cm-filter-pills { display:flex; flex-wrap:wrap; gap:6px; }
        .cm-pill {
          padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700;
          border:1px solid var(--cm-border); background:#fff; color:var(--cm-muted);
          cursor:pointer; font-family:'Inter',sans-serif;
          opacity:0; animation: cm-pill 0.35s cubic-bezier(.34,1.56,.64,1) both;
          transition:all 0.18s ease;
        }
        .cm-pill:hover { border-color:rgba(62,24,249,0.3); color:var(--cm-purple); transform:translateY(-1px); }
        .cm-pill-active {
          background:var(--cm-purple); color:#fff; border-color:var(--cm-purple);
          box-shadow:0 4px 12px rgba(62,24,249,0.25);
        }
        .cm-pill-active:hover { color:#fff; }

        /* ── Grid ── */
        .cm-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));
          gap:20px;
        }

        /* ── Card ── */
        .cm-card {
          background:var(--cm-card); border-radius:16px;
          border:1px solid var(--cm-border);
          box-shadow:0 8px 28px rgba(2,6,23,0.05);
          overflow:hidden; display:flex; flex-direction:column;
          position:relative;
          transition:transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s ease;
        }
        .cm-card:hover {
          transform:translateY(-4px);
          box-shadow:0 22px 50px rgba(2,6,23,0.12);
        }
        .cm-card-expired { opacity:0.60; filter:saturate(0.5); }
        .cm-card-expired:hover { opacity:0.80; filter:saturate(0.75); }

        /* Aurora cursor effect */
        .cert-aurora::before {
          content:""; position:absolute; inset:0; border-radius:inherit; padding:1.5px;
          background:radial-gradient(560px circle at var(--mx,50%) var(--my,50%),
            rgba(62,24,249,0.16), transparent 42%);
          -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor; mask-composite:exclude;
          pointer-events:none; z-index:1;
        }
        .cert-aurora::after {
          content:""; position:absolute; inset:0;
          background:radial-gradient(700px circle at var(--mx,50%) var(--my,50%),
            rgba(55,215,250,0.05), transparent 42%);
          pointer-events:none; z-index:0;
        }

        /* Card top bar */
        .cm-card-bar {
          height:3px; width:100%; flex-shrink:0;
          background:linear-gradient(90deg, var(--cm-purple), var(--cm-cyan));
          animation: cm-pulse 3s ease-in-out infinite;
          position:relative; overflow:hidden;
        }
        .cm-card-bar::after {
          content:""; position:absolute; inset:0;
          background:linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
          animation: cm-shimmer 2.5s ease-in-out infinite;
        }
        .cm-bar-gold {
          background:linear-gradient(90deg, var(--cm-gold), #fbbf24);
        }

        /* Thumbnail */
        .cm-thumb {
          height:156px; position:relative; overflow:hidden; flex-shrink:0;
          background:linear-gradient(135deg, rgba(62,24,249,0.06) 0%, rgba(55,215,250,0.06) 100%);
        }
        .cm-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .cm-thumb-placeholder {
          width:100%; height:100%;
          display:flex; align-items:center; justify-content:center;
          color:rgba(62,24,249,0.28);
        }

        .cm-badge-featured, .cm-badge-expired, .cm-badge-valid {
          position:absolute; font-size:11px; font-weight:800;
          padding:4px 9px; border-radius:999px;
          display:inline-flex; align-items:center; gap:4px;
        }
        .cm-badge-featured {
          top:10px; left:10px;
          background:rgba(245,158,11,0.92); color:#78350f;
        }
        .cm-badge-expired {
          top:10px; right:10px;
          background:rgba(239,68,68,0.90); color:#fff;
        }
        .cm-badge-valid {
          top:10px; right:10px;
          background:rgba(34,197,94,0.90); color:#fff;
        }

        /* Card body */
        .cm-card-body {
          padding:16px; display:flex; flex-direction:column; gap:10px; flex:1;
          position:relative; z-index:2;
        }
        .cm-card-name { font-size:15px; font-weight:800; margin:0; line-height:1.3; }
        .cm-card-org  {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          color:var(--cm-purple); display:flex; align-items:center; gap:5px; margin:0;
        }
        .cm-card-desc {
          font-size:12px; line-height:1.55; color:var(--cm-muted); margin:0;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }

        /* Dates */
        .cm-dates { display:flex; flex-direction:column; gap:5px; }
        .cm-date-item {
          display:flex; align-items:center; gap:5px;
          font-size:12px; color:var(--cm-muted);
        }
        .cm-date-expired .cm-date-val { color:var(--cm-red); }
        .cm-date-lbl { font-weight:600; }
        .cm-date-val { font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700; color:var(--cm-text); }

        /* Credential ID */
        .cm-cred-id {
          display:flex; align-items:center; gap:5px;
          font-family:'IBM Plex Mono',monospace; font-size:11px;
          color:var(--cm-muted); background:rgba(15,23,42,0.04);
          padding:5px 9px; border-radius:6px; border:1px solid var(--cm-border);
          word-break:break-all;
        }

        /* Links */
        .cm-links { display:flex; flex-wrap:wrap; gap:7px; margin-top:auto; padding-top:4px; }
        .cm-link {
          font-size:12px; font-weight:700; text-decoration:none;
          display:inline-flex; align-items:center; gap:4px;
          padding:5px 12px; border-radius:999px; border:1px solid;
          transition:all 0.18s ease;
        }
        .cm-link-primary {
          color:var(--cm-purple); border-color:rgba(62,24,249,0.25);
          background:rgba(62,24,249,0.05);
        }
        .cm-link-primary:hover { background:rgba(62,24,249,0.12); transform:translateY(-1px); }
        .cm-link-ghost {
          color:var(--cm-muted); border-color:var(--cm-border);
          background:transparent;
        }
        .cm-link-ghost:hover { color:var(--cm-text); border-color:rgba(15,23,42,0.2); transform:translateY(-1px); }

        /* Card actions */
        .cm-card-actions {
          display:flex; gap:6px; padding:10px 14px;
          border-top:1px solid var(--cm-border); position:relative; z-index:2;
        }
        .cm-act-edit, .cm-act-del {
          border:none; cursor:pointer; border-radius:7px; font-weight:700; font-size:12px;
          display:inline-flex; align-items:center; gap:5px; padding:7px 12px;
          font-family:'Inter',sans-serif; transition:all 0.18s ease;
        }
        .cm-act-edit {
          background:rgba(62,24,249,0.07); color:var(--cm-purple); flex:1; justify-content:center;
        }
        .cm-act-edit:hover { background:rgba(62,24,249,0.14); transform:translateY(-1px); }
        .cm-act-del  { background:rgba(239,68,68,0.07); color:var(--cm-red); }
        .cm-act-del:hover  { background:rgba(239,68,68,0.14); transform:translateY(-1px); }

        /* ── Modal overlay ── */
        .cm-overlay {
          position:fixed; inset:0; background:rgba(10,15,30,0.55);
          display:flex; align-items:center; justify-content:center;
          z-index:300; padding:16px; box-sizing:border-box;
          animation:cm-fadeIn 0.2s ease both; backdrop-filter:blur(6px);
        }
        .cm-modal {
          background:var(--cm-card); border-radius:18px;
          border:1px solid var(--cm-border);
          box-shadow:0 40px 100px rgba(2,6,23,0.22);
          width:100%; max-width:600px; max-height:92vh;
          display:flex; flex-direction:column; overflow:hidden;
          animation:cm-modal 0.30s cubic-bezier(.22,1,.36,1) both;
          position:relative;
        }

        .cm-modal-accent {
          position:absolute; top:0; left:0; right:0; height:4px;
          background:linear-gradient(90deg, var(--cm-purple) 0%, var(--cm-cyan) 100%);
          animation:cm-pulse 3s ease-in-out infinite; z-index:10;
        }

        .cm-modal-header {
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:22px 24px 18px; border-bottom:1px solid var(--cm-border);
          flex-shrink:0; margin-top:4px;
        }
        .cm-modal-header h3 { font-size:18px; font-weight:900; margin:0 0 3px; }
        .cm-modal-sub { font-size:12px; color:var(--cm-muted); margin:0; font-family:'IBM Plex Mono',monospace; }
        .cm-modal-x {
          border:none; background:rgba(15,23,42,0.06); color:var(--cm-text);
          width:30px; height:30px; border-radius:8px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          transition:background 0.15s, transform 0.2s;
        }
        .cm-modal-x:hover { background:rgba(15,23,42,0.12); transform:rotate(90deg); }

        .cm-modal-body {
          padding:22px 24px; overflow-y:auto;
          display:flex; flex-direction:column; gap:14px; flex:1;
        }
        .cm-modal-footer {
          display:flex; justify-content:flex-end; gap:10px;
          padding:14px 24px; border-top:1px solid var(--cm-border); flex-shrink:0;
        }

        /* Form fields */
        .cm-mrow   { display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; }
        .cm-m2col  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .cm-mfield { display:flex; flex-direction:column; gap:5px; }
        .cm-mfield-grow   { flex:1; min-width:160px; }
        .cm-mfield-toggle { flex-shrink:0; }

        .cm-mfield label {
          font-family:'IBM Plex Mono',monospace; font-size:10px; font-weight:800;
          color:var(--cm-muted); text-transform:uppercase; letter-spacing:0.06em;
          display:flex; align-items:center; gap:4px;
        }
        .cm-req { color:var(--cm-red); }

        .cm-mfield input:not([type=checkbox]),
        .cm-mfield textarea {
          width:100%; padding:9px 13px; border-radius:10px;
          border:1px solid var(--cm-border); background:rgba(0,0,0,0.02);
          font-family:'Inter',sans-serif; font-size:13px; color:var(--cm-text);
          font-weight:600; transition:all 0.2s ease; box-sizing:border-box;
        }
        .cm-mfield input:focus, .cm-mfield textarea:focus {
          outline:none; border-color:var(--cm-purple); background:#fff;
          box-shadow:0 0 0 3px rgba(62,24,249,0.11); transform:translateY(-1px);
        }
        .cm-mfield textarea { resize:vertical; }
        .cm-mfield input[type=date] { cursor:pointer; }

        /* Field group label */
        .cm-field-group-label {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:800;
          color:var(--cm-purple); text-transform:uppercase; letter-spacing:0.06em;
          display:flex; align-items:center; gap:6px;
          padding-bottom:6px; border-bottom:1px solid rgba(62,24,249,0.12);
        }

        /* Toggle switch */
        .cm-sw { display:inline-flex; align-items:center; cursor:pointer; margin-top:4px; }
        .cm-sw input { display:none; }
        .cm-sw-track {
          width:40px; height:22px; border-radius:999px;
          background:rgba(15,23,42,0.12); position:relative;
          transition:background 0.22s cubic-bezier(.22,1,.36,1);
          border:1px solid var(--cm-border);
        }
        .cm-sw input:checked + .cm-sw-track { background:var(--cm-gold); border-color:var(--cm-gold); }
        .cm-sw-thumb {
          position:absolute; top:2px; left:2px; width:16px; height:16px;
          border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.20);
          transition:transform 0.22s cubic-bezier(.34,1.56,.64,1);
        }
        .cm-sw input:checked + .cm-sw-track .cm-sw-thumb { transform:translateX(18px); }

        /* Live preview */
        .cm-preview {
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap;
          gap:10px; padding:12px 16px; border-radius:12px;
          border:1px solid rgba(62,24,249,0.15);
          background:linear-gradient(135deg, rgba(62,24,249,0.04), rgba(55,215,250,0.04));
        }
        .cm-preview-left  { display:flex; align-items:center; gap:10px; }
        .cm-preview-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .cm-preview-icon {
          width:40px; height:40px; border-radius:10px; flex-shrink:0;
          border:1px solid rgba(62,24,249,0.2); background:rgba(62,24,249,0.07);
          display:flex; align-items:center; justify-content:center;
          color:rgba(62,24,249,0.5); overflow:hidden;
        }
        .cm-preview-icon img { width:100%; height:100%; object-fit:contain; }
        .cm-preview-name { font-size:13px; font-weight:800; margin:0 0 2px; }
        .cm-preview-org  { font-size:11px; color:var(--cm-muted); margin:0; font-family:'IBM Plex Mono',monospace; }
        .cm-preview-date {
          font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:700;
          color:var(--cm-muted);
        }
        .cm-preview-feat {
          font-size:11px; font-weight:800; padding:3px 8px; border-radius:4px;
          background:rgba(245,158,11,0.12); color:#b45309;
          display:inline-flex; align-items:center; gap:4px;
        }

        /* Buttons */
        .cm-btn-ghost {
          background:rgba(15,23,42,0.06); color:var(--cm-text); border:none;
          padding:9px 16px; border-radius:8px; font-weight:700; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .cm-btn-ghost:hover { background:rgba(15,23,42,0.11); }

        .cm-btn-save {
          background:var(--cm-purple); color:#fff; border:none;
          padding:9px 20px; border-radius:8px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          font-family:'Inter',sans-serif;
          box-shadow:0 4px 16px rgba(62,24,249,0.28);
          transition:all 0.22s ease;
        }
        .cm-btn-save:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(62,24,249,0.38); }
        .cm-btn-save:disabled { opacity:0.55; cursor:not-allowed; transform:none; }

        .cm-btn-danger {
          background:rgba(239,68,68,0.10); color:var(--cm-red); border:none;
          padding:9px 16px; border-radius:8px; font-weight:800; font-size:13px;
          cursor:pointer; display:inline-flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .cm-btn-danger:hover { background:rgba(239,68,68,0.18); }

        /* Confirm */
        .cm-confirm {
          background:var(--cm-card); border-radius:16px; border:1px solid var(--cm-border);
          box-shadow:0 28px 70px rgba(2,6,23,0.20); padding:32px 28px;
          text-align:center; max-width:350px; width:100%;
          animation:cm-modal 0.25s cubic-bezier(.22,1,.36,1) both;
        }
        .cm-confirm-icon { font-size:44px; margin-bottom:14px; }
        .cm-confirm h3   { font-size:18px; font-weight:900; margin:0 0 8px; }
        .cm-confirm p    { color:var(--cm-muted); font-size:13px; margin:0 0 24px; }
        .cm-confirm-row  { display:flex; gap:10px; justify-content:center; }

        /* Spinners */
        .cm-spin {
          width:13px; height:13px; border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff; border-radius:50%; animation:cm-spin360 0.5s linear infinite;
        }
        .cm-ring {
          width:38px; height:38px; border:3px solid rgba(62,24,249,0.18);
          border-top-color:var(--cm-purple); border-radius:50%; animation:cm-spin360 0.7s linear infinite;
        }
        .cm-loading {
          display:flex; flex-direction:column; align-items:center;
          padding:100px 20px; gap:16px;
          font-family:'IBM Plex Mono',monospace; font-size:13px; color:var(--cm-muted);
        }

        /* Empty */
        .cm-empty {
          display:flex; flex-direction:column; align-items:center;
          padding:80px 20px; gap:14px; text-align:center;
        }
        .cm-empty-glyph { font-size:52px; }
        .cm-empty h3    { font-size:20px; font-weight:900; margin:0; }
        .cm-empty p     { color:var(--cm-muted); font-size:14px; margin:0; max-width:320px; }

        /* ── Responsive ── */
        @media (max-width:900px) {
          .cm-stats { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .cm-grid  { grid-template-columns:1fr; }
          .cm-stats { grid-template-columns:repeat(2,1fr); gap:10px; }
          .cm-m2col { grid-template-columns:1fr; }
          .cm-modal { max-height:96vh; }
          .cm-modal-body { padding:16px; }
          .cm-modal-header, .cm-modal-footer { padding:14px 16px; }
          .cm-filters { flex-direction:column; align-items:stretch; }
          .cm-search-wrap { max-width:100%; }
          .cm-header { flex-direction:column; align-items:flex-start; }
        }
        @media (max-width:400px) {
          .cm-stats { grid-template-columns:1fr 1fr; gap:8px; }
          .cm-stat-val { font-size:20px; }
        }
      `}</style>
    </div>
  );
};

export default CertificatesManager;