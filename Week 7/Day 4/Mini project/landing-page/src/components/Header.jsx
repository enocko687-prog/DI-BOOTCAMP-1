import React from "react";

export default function Header({ menuOpen, onMenuToggle, onNavigate }) {
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={onNavigate} aria-label="Northline Studio home">
        <span className="brand-mark" aria-hidden="true">n.</span>
        northline<span className="brand-studio">STUDIO</span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={onMenuToggle}
      >
        <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} aria-hidden="true" />
      </button>
      <nav id="primary-navigation" className={`primary-navigation${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <a href="#home" onClick={onNavigate}>Home</a>
        <a href="#services" onClick={onNavigate}>What we do</a>
        <a href="#about" onClick={onNavigate}>Our approach</a>
        <a className="nav-contact" href="#contact" onClick={onNavigate}>Let&apos;s talk <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
      </nav>
    </header>
  );
}