import { Routes, Route, Outlet } from "react-router-dom";

// Pages
import Home    from "./pages/Home";
import Login   from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Dashboard Sub-pages
import DashboardOverview    from "./components/admin/DashboardOverview";
import ProfileSettings      from "./components/admin/ProfileSettings";
import ProjectManagement    from "./components/admin/ProjectManagement";
import SkillsManager        from "./components/admin/SkillManagement";
import CertificatesManager  from "./components/admin/Certificatesmanager"; // ← NEW

// Components
import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";

/* =========================
    Public Layout
========================= */
const PublicLayout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "calc(100vh - 200px)" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

/* =========================
    App Routes
========================= */
function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* Protected Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* /admin/dashboard */}
        <Route index element={<DashboardOverview />} />

        {/* /admin/dashboard/projects */}
        <Route path="projects" element={<ProjectManagement />} />

        {/* /admin/dashboard/settings */}
        <Route path="settings" element={<ProfileSettings />} />

        {/* /admin/dashboard/skills */}
        <Route path="skills" element={<SkillsManager />} />

        {/* /admin/dashboard/certificates */}
        <Route path="certificates" element={<CertificatesManager />} />

        {/* Placeholders */}
        <Route path="leads"   element={<PlaceholderPage title="Freelance Leads" />} />
        <Route path="content" element={<PlaceholderPage title="CHHAVA.AI Content Management" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

/* Placeholder for coming-soon routes */
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "80px 20px", textAlign: "center",
    fontFamily: "'Inter', sans-serif",
  }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.03em" }}>{title}</h2>
    <p style={{ color: "#52525B", fontSize: 14, margin: 0 }}>Coming soon — check back later.</p>
  </div>
);

export default App;