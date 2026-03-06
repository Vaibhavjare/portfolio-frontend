import React, { useState } from "react";
import { useLoginMutation } from "../redux/services/authApi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY || "portfolio_token";

const Login = () => {
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await login({ email, password }).unwrap();

      console.log("Login success:", res);

      // Save token
      localStorage.setItem(TOKEN_KEY, res.access_token);

      toast.success("Login successful");

      // Redirect
      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error?.data?.detail || "Invalid email or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-wrapper">
      {/* Animated LlamaIndex Aurora Glows */}
      <div className="aurora-container">
        <div className="glow glow-cyan"></div>
        <div className="glow glow-purple"></div>
        <div className="glow glow-pink"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h2>
            <span className="gradient-text">Admin</span> Access
          </h2>
          <p className="subtitle">
            Sign in to manage your portfolio and projects.
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="vaibhav@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {/* SVG Eye Icon */}
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="register-prompt">
          <p>Don't have an account? <Link to="/admin/register" className="register-link">Register here</Link></p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;800&display=swap');

        /* ================= COLOR VARIABLES ================= */
        :root {
          --li-bg: #FCFCFC;
          --li-card-bg: #FFFFFF;
          --li-border: #EFEFEF;
          --li-text-main: #000000;
          --li-text-muted: #52525B;
          
          --li-cyan: #37D7FA;
          --li-purple: #3E18F9;
          --li-pink: #FF8DF2;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: var(--li-bg);
          color: var(--li-text-main);
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* ================= ANIMATED AURORA GLOWS ================= */
        .aurora-container {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          overflow: hidden; z-index: 0; pointer-events: none;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
          mix-blend-mode: multiply;
          animation: floatGlow 10s ease-in-out infinite alternate;
        }

        .glow-cyan {
          width: 500px; height: 500px;
          background: var(--li-cyan);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }

        .glow-purple {
          width: 400px; height: 400px;
          background: var(--li-purple);
          bottom: 20%; right: -50px;
          opacity: 0.3;
          animation-delay: -3s;
        }

        .glow-pink {
          width: 400px; height: 400px;
          background: var(--li-pink);
          top: 20%; right: 20%;
          opacity: 0.25;
          animation-delay: -6s;
        }

        @keyframes floatGlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.1); }
        }

        /* ================= LOGIN CARD ================= */
        .login-card {
          background: var(--li-card-bg);
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: 12px;
          border: 1px solid var(--li-border);
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          position: relative;
          z-index: 10;
          box-sizing: border-box;
        }

        .login-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--li-purple), var(--li-cyan));
          border-top-left-radius: 12px; border-top-right-radius: 12px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h2 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 8px 0;
        }

        .gradient-text {
          background: linear-gradient(90deg, var(--li-purple), var(--li-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: var(--li-text-muted);
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        /* ================= FORM STYLES ================= */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--li-text-main);
        }

        .input-group input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 6px; /* Sharper inputs */
          border: 1px solid var(--li-border);
          background: #F9FAFB;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          color: var(--li-text-main);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .input-group input::placeholder {
          color: #A3A3A3;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--li-purple);
          background: var(--li-card-bg);
          box-shadow: 0 0 0 3px rgba(62, 24, 249, 0.1);
        }

        /* --- PASSWORD INPUT CONTAINER --- */
        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-container input {
          padding-right: 45px;
        }

        .toggle-password-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--li-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .toggle-password-btn:hover { color: var(--li-text-main); }
        .toggle-password-btn:focus { outline: none; color: var(--li-purple); }

        /* ================= BUTTONS & LINKS ================= */
        .login-btn {
          margin-top: 10px;
          width: 100%;
          padding: 14px;
          border-radius: 6px; /* Sharper button */
          border: none;
          font-weight: 600;
          font-size: 16px;
          background: var(--li-text-main);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.1);
        }

        .login-btn:hover:not(:disabled) {
          background: var(--li-purple);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(62, 24, 249, 0.23);
        }

        .login-btn:disabled {
          background: var(--li-text-muted);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .register-prompt {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: var(--li-text-muted);
        }

        .register-link {
          color: var(--li-purple);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .register-link:hover {
          color: var(--li-cyan);
          text-decoration: underline;
        }

        /* ================= RESPONSIVE DESIGN ================= */
        @media (max-width: 480px) {
          .login-wrapper { padding: 16px; }
          .login-card { padding: 32px 24px; width: 100%; }
          .login-header h2 { font-size: 24px; }
          .subtitle { font-size: 13px; }
          .input-group input { padding: 12px 14px; font-size: 16px; }
          .password-input-container input { padding-right: 40px; }
          .login-btn { padding: 12px; font-size: 15px; }

          /* Shrink Aurora Glows on mobile */
          .glow-cyan { width: 300px; height: 300px; top: -50px; left: -50px; }
          .glow-purple { width: 250px; height: 250px; bottom: 10%; right: -20px; }
          .glow-pink { display: none; /* Hide one glow on mobile to save performance */ }
        }
      `}</style>
    </div>
  );
};

export default Login;