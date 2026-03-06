

const ProjectsSection = () => {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Featured Projects</h2>
      </div>

      <div className="project-grid">
        <div className="project-card">
          <div className="project-icon">🤖</div>
          <h3>AI Agent Platform</h3>
          <p>Multi-agent reasoning system with memory.</p>
        </div>

        <div className="project-card">
          <div className="project-icon">🧠</div>
          <h3>3D MRI Reconstruction</h3>
          <p>Generated 3D brain model from MRI slices.</p>
        </div>

        <div className="project-card">
          <div className="project-icon">🕶️</div>
          <h3>AR Fashion Preview</h3>
          <p>Real-time outfit try-on using AR.</p>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;