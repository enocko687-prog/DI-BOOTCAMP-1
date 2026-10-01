import { useState } from "react";
import Header from "./components/Header.jsx";
import ServiceCard from "./components/ServiceCard.jsx";
import Contact from "./components/Contact.jsx";

const services = [
  {
    number: "01",
    icon: "fa-compass-drafting",
    title: "Brand foundations",
    description: "A clear point of view, a memorable identity, and the tools to bring your story to life.",
    color: "coral",
  },
  {
    number: "02",
    icon: "fa-window-maximize",
    title: "Digital experiences",
    description: "Useful, considered websites that make every interaction feel effortless.",
    color: "blue",
  },
  {
    number: "03",
    icon: "fa-chart-line",
    title: "Creative direction",
    description: "A steady creative partner to help your next big idea find its shape and audience.",
    color: "lime",
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen(!menuOpen)} onNavigate={closeMenu} />
      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Independent creative studio · Est. 2018</p>
            <h1 id="hero-title">Good work<br />starts with <span>good questions.</span></h1>
            <p className="hero-description">We help thoughtful businesses turn big ideas into brands and digital experiences people remember.</p>
            <a className="button button-dark" href="#services">Explore our work <i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>
            <div className="hero-note"><span className="note-line" /> Small team. Big-picture thinking.</div>
          </div>
          <div className="hero-image" role="img" aria-label="A sunlit creative studio with shared work tables">
            <div className="image-label"><span className="label-dot" /> Ideas in good company</div>
            <div className="image-index">NL—026</div>
          </div>
          <div className="hero-side-note" aria-hidden="true">STRATEGY · DESIGN · DIGITAL</div>
        </section>

        <section className="services section-wrap" id="services" aria-labelledby="services-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What we do</p>
              <h2 id="services-title">Make it matter.</h2>
            </div>
            <p className="section-intro">The right mix of clarity and craft, shaped around where you want to go.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => <ServiceCard key={service.number} service={service} />)}
          </div>
        </section>

        <Contact />
      </main>
      <footer className="site-footer">
        <a className="brand footer-brand" href="#home"><span className="brand-mark" aria-hidden="true">n.</span> northline<span className="brand-studio">STUDIO</span></a>
        <p>Independent by nature. Better together.</p>
        <a href="#home" className="back-to-top">Back to top <i className="fa-solid fa-arrow-up" aria-hidden="true" /></a>
      </footer>
    </>
  );
}