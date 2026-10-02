import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-inner section-wrap" id="about">
        <div className="contact-copy">
          <p className="eyebrow">A good place to start</p>
          <h2 id="contact-title">Have a good one<br />in mind?</h2>
          <p>Tell us what you&apos;re working on. We&apos;ll bring the coffee and a few good questions.</p>
          <a className="email-link" href="mailto:hello@northline.studio">hello@northline.studio <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></a>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Your name</label>
          <input id="contact-name" name="name" type="text" placeholder="Name" autoComplete="name" required />
          <label htmlFor="contact-email">Email address</label>
          <input id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          <label htmlFor="contact-message">A little about your project</label>
          <textarea id="contact-message" name="message" rows="3" placeholder="What's on your mind?" required />
          <button className="button button-light" type="submit">Send an enquiry <i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
          {sent && <p className="form-success" role="status">Thanks for reaching out. We&apos;ll be in touch soon.</p>}
        </form>
      </div>
    </section>
  );
}