"use strict";

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const prayerForm = document.getElementById("prayerForm");
const formMessage = document.getElementById("formMessage");
const backToTop = document.querySelector(".back-to-top");
const heroBackgrounds = document.querySelectorAll(".hero-background");

if (
  heroBackgrounds.length > 1 &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  let visibleBackground = 0;
  window.setInterval(() => {
    heroBackgrounds[visibleBackground].classList.remove("is-visible");
    visibleBackground = (visibleBackground + 1) % heroBackgrounds.length;
    heroBackgrounds[visibleBackground].classList.add("is-visible");
  }, 6000);
}

function setMenuOpen(isOpen) {
  mainNav.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
  menuToggle.textContent = isOpen ? "✕" : "☰";
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav.classList.contains("open")) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (
    mainNav.classList.contains("open") &&
    !mainNav.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    setMenuOpen(false);
  }
});

currentYear.textContent = new Date().getFullYear();

prayerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!prayerForm.reportValidity()) {
    return;
  }

  const name = document.getElementById("prayerName").value.trim();
  const email = document.getElementById("prayerEmail").value.trim();
  const category = document.getElementById("prayerCategory").value;
  const message = document.getElementById("prayerMessage").value.trim();

  const submitButton = prayerForm.querySelector('button[type="submit"]');
  if (submitButton.disabled) {
    return;
  }
  submitButton.disabled = true;
  prayerForm.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = true;
  });
  formMessage.textContent = "Sending your request securely...";
  formMessage.classList.remove("is-error");

  try {
    const response = await fetch("/api/prayer-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, category, message, consent: true }),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The website could not process your request. Please try again later.");
    }

    if (!response.ok) {
      throw new Error(result.error || "Your request could not be sent.");
    }

    prayerForm.reset();
    formMessage.textContent =
      "Your prayer request was saved privately for authorized church staff.";
  } catch (error) {
    formMessage.textContent =
      error instanceof TypeError
        ? "Could not connect to the church website. Please try again later."
        : error.message;
    formMessage.classList.add("is-error");
  } finally {
    prayerForm.querySelectorAll("input, select, textarea").forEach((field) => {
      field.disabled = false;
    });
    submitButton.disabled = false;
  }
});

prayerForm.addEventListener("input", () => {
  formMessage.textContent = "";
  formMessage.classList.remove("is-error");
});

window.addEventListener(
  "scroll",
  () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 500);
  },
  { passive: true }
);
