import React, { useState } from "react";
import toast from "react-hot-toast";
import { 
  Plus, Github, ExternalLink, Edit3, Trash2, 
  Code2, Database, Layout, X, Save, Star, Image as Link, Wrench, Video
} from "lucide-react";

// Type-Only Imports for verbatimModuleSyntax
import type { 
  Project, 
  ProjectCreateRequest 
} from "../../redux/services/projectApi";

import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "../../redux/services/projectApi";

const ProjectManagement = () => {
  const { data: projects, isLoading } = useGetProjectsQuery({});
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    github_url: "",
    live_url: "",
    image_url: "",
    complexity_score: 1,
    featured: false,
    programming_languages: "",
    frameworks: "",
    databases: "",
    tools: ""
  });

  const resetForm = () => {
    setForm({
      title: "", description: "", github_url: "", live_url: "",
      image_url: "", complexity_score: 1, featured: false,
      programming_languages: "", frameworks: "", databases: "", tools: ""
    });
    setEditingId(null);
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.project_id);
    const languages = Array.isArray(project.tech_stack) ? project.tech_stack.join(", ") : "";
    
    setForm({
      title: project.title,
      description: project.description || "",
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      image_url: project.image_url || "",
      complexity_score: project.complexity_score || 1,
      featured: project.featured || false,
      programming_languages: languages,
      frameworks: "",
      databases: "",
      tools: ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mergedStack = [
      ...form.programming_languages.split(","),
      ...form.frameworks.split(","),
      ...form.databases.split(","),
      ...form.tools.split(",")
    ].map(s => s.trim()).filter(Boolean);

    const payload: ProjectCreateRequest = {
      title: form.title,
      description: form.description || undefined,
      github_url: form.github_url || undefined,
      live_url: form.live_url || undefined,
      image_url: form.image_url || undefined,
      complexity_score: Number(form.complexity_score),
      featured: form.featured,
      tech_stack: mergedStack,
    };

    try {
      if (editingId) {
        await updateProject({ projectId: editingId, body: payload }).unwrap();
        toast.success("Changes committed successfully!");
      } else {
        await createProject(payload).unwrap();
        toast.success("Project deployed!");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.data?.detail?.[0]?.msg || "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id).unwrap();
      toast.success("Project removed");
    } catch {
      toast.error("Action failed");
    }
  };

  if (isLoading) return <div className="loading mono-text">Gathering data assets...</div>;

  return (
    <div className="project-wrapper">
      <div className="project-header flex-between">
        <div>
          <h2>Project <span className="gradient-text">Laboratory</span></h2>
          <p className="subtitle">Manage your portfolio deployments.</p>
        </div>
        <button className="add-btn-brand" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={16} /> <span className="btn-text">New Project</span>
        </button>
      </div>

      <div className="project-grid-layout">
        {projects?.map((project) => (
          <div key={project.project_id} className="project-card">
            <div className="card-top-border"></div>
            <div className="project-media">
              <img src={project.image_url || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=600"} alt={project.title} />
              {project.featured && <span className="pill-badge-featured"><Star size={10} fill="currentColor" /> Featured</span>}
              <div className="complexity-overlay mono-text">Level {project.complexity_score}</div>
            </div>
            
            <div className="project-body">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description?.substring(0, 85)}...</p>
              
              <div className="stack-container">
                {Array.isArray(project.tech_stack) && project.tech_stack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="stack-tag">{tech}</span>
                ))}
              </div>

              <div className="project-actions-footer">
                <div className="footer-links">
                  <a href={project.github_url} target="_blank" rel="noreferrer" className="icon-purple"><Github size={18} /></a>
                  <a href={project.live_url} target="_blank" rel="noreferrer" className="icon-cyan"><ExternalLink size={18} /></a>
                </div>
                <div className="footer-btns">
                  <button className="icon-action-btn" onClick={() => handleEdit(project)} aria-label="Edit"><Edit3 size={15} /></button>
                  <button className="icon-action-btn-danger" onClick={() => handleDelete(project.project_id)} aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-pane animate-slide-up">
            <div className="modal-top">
              <h3 className="mono-text-title">{editingId ? "Edit Project" : "Initialize Project"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-scroll-area">
                <div className="section-group">
                  <label className="mono-label">Project Identity</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title of the project" className="main-input" />
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Technical description..." />
                </div>

                <div className="form-row responsive-grid">
                  <div className="form-group">
                    <label className="mono-label"><Link size={12} className="icon-purple" /> Thumbnail Source</label>
                    <input type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label className="mono-label"><Video size={12} className="icon-purple" /> Video Access</label>
                    <input type="url" placeholder="https://..." />
                  </div>
                </div>

                <div className="form-row responsive-grid">
                  <div className="form-group">
                    <label className="mono-label">Repository URL</label>
                    <input type="url" value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} placeholder="GitHub URL" />
                  </div>
                  <div className="form-group">
                    <label className="mono-label">Deployment URL</label>
                    <input type="url" value={form.live_url} onChange={e => setForm({...form, live_url: e.target.value})} placeholder="Live Demo URL" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="mono-label">System Complexity: <span className="highlight-val">{form.complexity_score}</span></label>
                  <div className="slider-wrapper">
                      <input 
                        type="range" min="1" max="10" 
                        style={{ background: `linear-gradient(to right, #6D28D9 0%, #6D28D9 ${(form.complexity_score - 1) * 11.11}%, #E2E8F0 ${(form.complexity_score - 1) * 11.11}%, #E2E8F0 100%)` }}
                        value={form.complexity_score} 
                        onChange={e => setForm({...form, complexity_score: parseInt(e.target.value)})} 
                        className="complexity-slider"
                      />
                  </div>
                </div>

                <div className="tech-stack-grid responsive-grid">
                  <div className="form-group">
                    <label className="mono-label"><Code2 size={12} className="icon-cyan"/> Languages</label>
                    <input value={form.programming_languages} onChange={e => setForm({...form, programming_languages: e.target.value})} placeholder="Python, JS..." />
                  </div>
                  <div className="form-group">
                    <label className="mono-label"><Layout size={12} className="icon-purple"/> Frameworks</label>
                    <input value={form.frameworks} onChange={e => setForm({...form, frameworks: e.target.value})} placeholder="React, FastAPI..." />
                  </div>
                  <div className="form-group">
                    <label className="mono-label"><Database size={12} className="icon-orange"/> Databases</label>
                    <input value={form.databases} onChange={e => setForm({...form, databases: e.target.value})} placeholder="PostgreSQL..." />
                  </div>
                  <div className="form-group">
                    <label className="mono-label"><Wrench size={12} className="icon-cyan"/> Tools</label>
                    <input value={form.tools} onChange={e => setForm({...form, tools: e.target.value})} placeholder="Docker, AWS..." />
                  </div>
                </div>
              </div>

              <div className="modal-footer-brand">
                <label className="checkbox-brand">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} />
                  <span className="check-text">Highlight Project</span>
                </label>
                <button type="submit" className="save-btn-brand">
                   <Save size={16} /> <span>{editingId ? "Save Changes" : "Deploy Project"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;700&family=Inter:wght@400;500;600;800;900&display=swap');
        
        /* --- CORE WRAPPER --- */
        .project-wrapper { 
          max-width: 1400px; 
          margin: auto; 
          font-family: 'Inter', sans-serif; 
          padding: 20px;
          box-sizing: border-box;
        }

        .gradient-text { 
          background: linear-gradient(90deg, #FF8A3D, #6D28D9, #22D3EE); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
        }

        .flex-between { display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; }
        
        .icon-purple { color: #6D28D9; }
        .icon-cyan { color: #22D3EE; }
        .icon-orange { color: #FF8A3D; }

        .add-btn-brand { 
          background: #000; color: #fff; padding: 10px 22px; border-radius: 999px; 
          border: none; font-weight: 800; font-size: 13px; cursor: pointer; 
          display: flex; align-items: center; gap: 8px; transition: 0.2s;
          white-space: nowrap;
        }
        .add-btn-brand:hover { background: #6D28D9; transform: translateY(-2px); }

        /* --- RESPONSIVE GRID --- */
        .project-grid-layout { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); 
          gap: 24px; 
          margin-top: 32px; 
        }

        .project-card { 
          background: #fff; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); 
          overflow: hidden; position: relative; transition: all 0.3s ease;
          display: flex; flex-direction: column;
        }
        .project-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
        
        .card-top-border { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #FF8A3D, #6D28D9); opacity: 0; transition: 0.3s; }
        .project-card:hover .card-top-border { opacity: 1; }

        .project-media { height: 190px; background: #000; position: relative; flex-shrink: 0; }
        .project-media img { width: 100%; height: 100%; object-fit: cover; }
        .complexity-overlay { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255,255,255,0.2); }

        .project-body { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
        .project-title { font-size: 20px; font-weight: 900; margin-bottom: 8px; color: #0F172A; word-break: break-word; }
        .project-desc { font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 16px; flex-grow: 1; }

        .stack-container { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .stack-tag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; background: #F8FAFC; color: #475569; padding: 5px 10px; border-radius: 6px; border: 1px solid #E2E8F0; }

        .project-actions-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #F1F5F9; }
        .footer-links { display: flex; gap: 12px; color: #94A3B8; }
        .footer-btns { display: flex; gap: 8px; }
        .icon-action-btn, .icon-action-btn-danger { background: #F8FAFC; border: 1px solid #E2E8F0; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; }
        .icon-action-btn:hover { background: #F1F5F9; color: #6D28D9; }
        .icon-action-btn-danger:hover { background: #FEF2F2; color: #EF4444; }

        /* --- MODAL RESPONSIVENESS --- */
        .modal-backdrop { 
          position: fixed; inset: 0; background: rgba(15,23,42,0.5); 
          backdrop-filter: blur(10px); display: flex; align-items: center; 
          justify-content: center; z-index: 1000; padding: 15px;
          box-sizing: border-box;
        }
        .modal-pane { 
          background: #fff; width: 100%; max-width: 700px; border-radius: 20px; 
          max-height: 95vh; display: flex; flex-direction: column;
          box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden;
        }
        .modal-top { padding: 24px 32px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; flex-shrink: 0; }
        .admin-form { display: flex; flex-direction: column; overflow: hidden; height: 100%; }
        
        .form-scroll-area { padding: 16px 32px 32px; overflow-y: auto; flex-grow: 1; }
        
        /* Custom Scrollbar for Form Area */
        .form-scroll-area::-webkit-scrollbar { width: 6px; }
        .form-scroll-area::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }

        .mono-label { display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 8px; letter-spacing: 0.05em; margin-top: 20px; }
        .admin-form input, .admin-form textarea { width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid #E2E8F0; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; box-sizing: border-box; background: #FBFBFC; transition: 0.2s; }
        .admin-form input:focus, .admin-form textarea:focus { outline: none; border-color: #6D28D9; background: #fff; box-shadow: 0 0 0 4px rgba(109,40,217,0.08); }

        .responsive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .complexity-slider { -webkit-appearance: none; width: 100%; height: 32px; border-radius: 10px; outline: none; margin: 10px 0; border: none !important; }
        .complexity-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #6D28D9; border-radius: 50%; cursor: pointer; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        
        .modal-footer-brand { 
          padding: 20px 32px; background: #FBFBFC; border-top: 1px solid #F1F5F9; 
          display: flex; justify-content: space-between; align-items: center; 
          gap: 15px; flex-shrink: 0;
        }
        .checkbox-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; font-weight: 700; color: #0F172A; }
        .save-btn-brand { background: #000; color: #fff; border: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; white-space: nowrap; }

        /* --- MOBILE TWEAKS --- */
        @media (max-width: 640px) {
          .responsive-grid { grid-template-columns: 1fr; }
          .modal-pane { border-radius: 0; max-height: 100vh; height: 100%; }
          .modal-top, .form-scroll-area, .modal-footer-brand { padding-left: 20px; padding-right: 20px; }
          .modal-footer-brand { flex-direction: column; align-items: stretch; }
          .save-btn-brand { justify-content: center; }
          .btn-text { display: none; }
          .add-btn-brand { padding: 10px; border-radius: 50%; }
        }

        .loading { text-align: center; margin-top: 100px; font-weight: 800; color: #6D28D9; }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ProjectManagement;