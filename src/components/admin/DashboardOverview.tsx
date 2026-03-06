

const DashboardOverview = () => {
  return (
    <>
      <header className="top-header">
        <h1>Welcome back, Vaibhav</h1>
        <p className="subtitle">Here is what's happening with your projects today.</p>
      </header>

      {/* Top Metrics Row */}
      <section className="metrics-grid">
        <div className="metric-card">
          <h3 className="metric-title">Active AI Agents</h3>
          <p className="metric-value gradient-text-alt">14</p>
          <span className="metric-trend positive">+2 this week</span>
        </div>
        
        <div className="metric-card">
          <h3 className="metric-title">Freelance Inquiries</h3>
          <p className="metric-value">08</p>
          <span className="metric-trend neutral">3 pending replies</span>
        </div>

        <div className="metric-card">
          <h3 className="metric-title">Insta Reels Scheduled</h3>
          <p className="metric-value">12</p>
          <span className="metric-trend positive">Queue healthy</span>
        </div>
      </section>

      {/* Project Status Section */}
      <section className="projects-section">
        <div className="section-header-flex">
          <h2>Active Deployments</h2>
          <button className="add-btn">+ New Project</button>
        </div>

        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Tech Stack</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-600">Blood Donation Management</td>
                <td><span className="tech-tag">React & Node</span></td>
                <td><span className="status-badge active">Production</span></td>
                <td className="mono-text">2 hours ago</td>
              </tr>
              <tr>
                <td className="fw-600">Multi-Agent RAG System</td>
                <td><span className="tech-tag">Python & FastAPI</span></td>
                <td><span className="status-badge testing">Testing</span></td>
                <td className="mono-text">1 day ago</td>
              </tr>
              <tr>
                <td className="fw-600">Game Engine Backend</td>
                <td><span className="tech-tag">C++ & SQL</span></td>
                <td><span className="status-badge planning">Planning</span></td>
                <td className="mono-text">3 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .top-header { margin-bottom: 40px; }
        .subtitle { color: var(--li-text-muted); font-size: 15px; margin-top: 8px; }
        .mono-text { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--li-text-muted); }
        .fw-600 { font-weight: 600; }
        
        .gradient-text-alt {
          background: linear-gradient(90deg, var(--li-cyan), var(--li-pink));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .metrics-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 48px;
        }

        .metric-card {
          background: var(--li-card-bg); padding: 24px; border-radius: 12px;
          border: 1px solid var(--li-border); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); transition: transform 0.2s ease;
        }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04); }

        .metric-title { font-size: 14px; color: var(--li-text-muted); font-weight: 600; margin-bottom: 12px; }
        .metric-value { font-size: 36px; font-weight: 800; margin: 0 0 8px 0; color: var(--li-text-main); font-family: 'IBM Plex Mono', monospace; }
        .metric-trend { font-size: 13px; font-weight: 500; }
        .metric-trend.positive { color: #10B981; }
        .metric-trend.neutral { color: #F59E0B; }

        .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        
        .add-btn {
          padding: 10px 20px; background: var(--li-text-main); color: white; border: none;
          border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s ease;
        }
        .add-btn:hover { background: var(--li-purple); }

        .table-container {
          background: var(--li-card-bg); border-radius: 12px; border: 1px solid var(--li-border);
          overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .project-table { width: 100%; border-collapse: collapse; text-align: left; }
        .project-table th {
          background: #F9FAFB; padding: 16px 24px; font-size: 13px; font-weight: 600;
          color: var(--li-text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--li-border);
        }
        .project-table td { padding: 16px 24px; border-bottom: 1px solid var(--li-border); font-size: 14px; }
        .project-table tr:last-child td { border-bottom: none; }
        .project-table tr:hover td { background: #F9FAFB; }

        .tech-tag {
          font-family: 'IBM Plex Mono', monospace; background: var(--li-bg); padding: 4px 8px;
          border-radius: 4px; font-size: 12px; color: var(--li-text-main); border: 1px solid var(--li-border);
        }

        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-badge.active { background: #DEF7EC; color: #03543F; }
        .status-badge.testing { background: #E1EFFE; color: #1E429F; }
        .status-badge.planning { background: #FEF3C7; color: #92400E; }

        @media (max-width: 768px) {
          .table-container { overflow-x: auto; }
        }
      `}</style>
    </>
  );
};

export default DashboardOverview;