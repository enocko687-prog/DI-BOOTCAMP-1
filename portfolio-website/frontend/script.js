"use strict";

document.documentElement.classList.add("has-js");

const API_BASE = "/api";
const contactEmail = "enocko687@gmail.com";
const currentYear = document.querySelector("#current-year");

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

const menuToggle = document.querySelector("#menu-btn");
const primaryMenu = document.querySelector("#primary-menu");

function closeMenu() {
    if (!menuToggle || !primaryMenu) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
}

if (menuToggle && primaryMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Open navigation menu" : "Close navigation menu"
        );
        primaryMenu.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("menu-open", !isOpen);
    });

    primaryMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
            closeMenu();
            menuToggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            closeMenu();
        }
    });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

async function fetchApi(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Accept: "application/json" }
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(result?.message || "The portfolio server is unavailable.");
    }

    return result;
}

function addExternalLink(container, label, value) {
    if (typeof value !== "string" || !value.trim()) {
        return;
    }

    let url;
    try {
        url = new URL(value);
    } catch {
        return;
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
        return;
    }

    const link = document.createElement("a");
    link.href = url.href;
    link.textContent = label;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    container.append(link);
}

function renderProject(project) {
    const card = document.createElement("article");
    card.className = "project-card database-project";

    const topLine = document.createElement("div");
    topLine.className = "project-topline";
    const projectLabel = document.createElement("span");
    projectLabel.textContent = "PORTFOLIO PROJECT";
    topLine.append(projectLabel);

    const info = document.createElement("div");
    info.className = "project-info database-project-info";
    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = String(project.ProjectName || "Untitled project");
    const description = document.createElement("p");
    description.textContent = String(project.Description || "");
    content.append(title, description);

    const details = document.createElement("div");
    const technologies = document.createElement("p");
    technologies.className = "project-kind";
    technologies.textContent = String(project.Technologies || "");
    details.append(technologies);
    addExternalLink(details, "View project ↗", project.ProjectURL);
    addExternalLink(details, "View source ↗", project.GitHubURL);

    info.append(content, details);

    if (typeof project.ImageURL === "string" && project.ImageURL.trim()) {
        const imageURL = new URL(project.ImageURL, window.location.origin);
        if (imageURL.protocol === "https:" || imageURL.origin === window.location.origin) {
            const image = document.createElement("img");
            image.className = "database-project-image";
            image.src = imageURL.href;
            image.alt = `Project image for ${String(project.ProjectName || "portfolio project")}`;
            image.loading = "lazy";
            card.append(image);
        }
    }

    card.append(topLine, info);
    return card;
}

const projectList = document.querySelector("#projectList");
const projectStatus = document.querySelector("#projectStatus");
if (projectList) {
    fetchApi("/projects")
        .then((projects) => {
            if (!Array.isArray(projects)) {
                throw new Error("The projects response was not in the expected format.");
            }

            if (projects.length === 0) {
                if (projectStatus) {
                    projectStatus.textContent = "No projects are in the database yet. The showcase examples remain visible.";
                }
                return;
            }

            projectList.replaceChildren(...projects.map(renderProject));
            if (projectStatus) {
                projectStatus.textContent = "Projects loaded from the portfolio database.";
            }
        })
        .catch(() => {
            if (projectStatus) {
                projectStatus.textContent = "The database is not connected yet; the portfolio showcase examples are shown instead.";
            }
        });
}

const skillList = document.querySelector("#skillList");
if (skillList) {
    fetchApi("/skills")
        .then((skills) => {
            if (!Array.isArray(skills)) {
                throw new Error("The skills response was not in the expected format.");
            }
            if (skills.length === 0) {
                return;
            }

            const items = skills.map((skill) => {
                const item = document.createElement("li");
                item.textContent = String(skill.SkillName || "");
                if (skill.Category) {
                    item.title = String(skill.Category);
                }
                return item;
            });
            skillList.replaceChildren(...items);
        })
        .catch(() => {
            const status = document.querySelector("#skillStatus");
            if (status) {
                status.textContent = "Database skills are unavailable; the starter skills remain visible.";
            }
        });
}

const experienceList = document.querySelector("#experienceList");
if (experienceList) {
    fetchApi("/experience")
        .then((experience) => {
            if (!Array.isArray(experience)) {
                throw new Error("The experience response was not in the expected format.");
            }
            if (experience.length === 0) {
                return;
            }

            const items = experience.map((item) => {
                const article = document.createElement("article");
                article.className = "journey-item";
                const marker = document.createElement("span");
                marker.className = "journey-marker";
                marker.setAttribute("aria-hidden", "true");
                const label = document.createElement("p");
                label.className = "journey-label";
                label.textContent = String(item.Organization || "EXPERIENCE");
                const title = document.createElement("h3");
                title.textContent = String(item.Position || "");
                const description = document.createElement("p");
                description.textContent = String(item.Description || "");
                article.append(marker, label, title, description);
                return article;
            });
            experienceList.replaceChildren(...items);
        })
        .catch(() => {
            const status = document.querySelector("#experienceStatus");
            if (status) {
                status.textContent = "Database experience is unavailable; the portfolio summary remains visible.";
            }
        });
}

function showEmailFallback(formNote, details) {
    const subject = encodeURIComponent(details.subject || `Portfolio message from ${details.fullName}`);
    const body = encodeURIComponent(
        `${details.message}\n\nFrom: ${details.fullName}\nEmail: ${details.email}`
    );
    formNote.textContent = "The server could not save your message. You can still send it directly: ";

    const link = document.createElement("a");
    link.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    link.textContent = `email ${contactEmail}`;
    formNote.append(link);
    formNote.classList.add("is-error");
}

const contactForm = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");

if (contactForm && formNote) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        formNote.classList.remove("is-error", "is-success");

        const formData = new FormData(contactForm);
        const details = {
            fullName: String(formData.get("fullName") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim()
        };

        if (!details.fullName || !details.email || !details.message) {
            formNote.textContent = "Please complete your name, email address, and message.";
            formNote.classList.add("is-error");
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
        formNote.textContent = "Sending your message…";

        try {
            const response = await fetch(`${API_BASE}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(details)
            });
            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(result?.message || "The message could not be saved.");
            }

            formNote.textContent = result.message || "Your message has been received.";
            formNote.classList.add("is-success");
            contactForm.reset();
        } catch (error) {
            showEmailFallback(formNote, details);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}
