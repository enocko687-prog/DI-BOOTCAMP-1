import React from "react";

export default function ServiceCard({ service }) {
  return (
    <article className={`service-card ${service.color}`}>
      <div className="card-topline">
        <span className="card-number">{service.number} / 03</span>
        <span className="card-icon" aria-hidden="true"><i className={`fa-solid ${service.icon}`} /></span>
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <a href="#contact" className="card-link" aria-label={`Ask us about ${service.title}`}>
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </a>
    </article>
  );
}