
import Spline from "@splinetool/react-spline";

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <div className="tagline-badge">
            <span className="dot"></span> Open for Freelance Projects
          </div>

          <h1>
            Hi, I'm <br />
            <span className="gradient-text">Vaibhav Jare</span>
          </h1>

          <div className="roles-scroller">
            <div className="roles-track">
              <span>Agentic AI Developer</span>
              <span className="separator">•</span>
              <span>Gen AI Developer</span>
              <span className="separator">•</span>
              <span>Full Stack Developer</span>
              <span className="separator">•</span>
              <span>Agentic AI Developer</span>
              <span className="separator">•</span>
              <span>Gen AI Developer</span>
            </div>
          </div>

          <p className="subtitle">
            Building intelligent, scalable, and high-performance applications.
            Specializing in reasoning systems, LLMs, and robust backend architecture.
          </p>

          <div className="buttons">
            <button className="primary-btn">View Projects</button>
            <button className="outline-btn">Contact Me</button>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="spline-wrapper">
            <div className="spline-loading">
              <span className="dot"></span> Loading 3D Environment...
            </div>
            <Spline 
              scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
              className="spline-canvas"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;