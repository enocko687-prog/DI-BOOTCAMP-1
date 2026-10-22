```javascript
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll("nav a");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu) {
        navMenu.classList.remove("active");
      }
    });
  });

  const heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(() => {});
  }

  const sectionBgVideo = document.querySelector(".section-bg-video");
  if (sectionBgVideo) {
    sectionBgVideo.muted = true;
    sectionBgVideo.play().catch(() => {});
  }

  const videoModal = document.getElementById("videoModal");
  const churchVideo = document.getElementById("churchVideo");
  const churchVideoSource = document.getElementById("churchVideoSource");
  const closeVideo = document.getElementById("closeVideo");

  const openVideoModal = (videoUrl, posterUrl) => {
    if (!videoModal || !churchVideo || !churchVideoSource) return;

    churchVideoSource.src = videoUrl;
    churchVideo.poster = posterUrl || "";
    churchVideo.load();
    videoModal.style.display = "flex";
    churchVideo.play().catch(() => {});
  };

  const closeVideoModal = () => {
    if (!videoModal || !churchVideo) return;

    videoModal.style.display = "none";
    churchVideo.pause();
    churchVideo.currentTime = 0;
  };

  document.querySelectorAll(".video-item").forEach((item) => {
    const playSelectedVideo = () => {
      const videoUrl = item.dataset.video;
      const posterUrl = item.dataset.poster;
      if (videoUrl) {
        openVideoModal(videoUrl, posterUrl);
      }
    };

    item.addEventListener("click", playSelectedVideo);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        playSelectedVideo();
      }
    });
  });

  if (closeVideo) {
    closeVideo.addEventListener("click", closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener("click", (event) => {
      if (event.target === videoModal) closeVideoModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeVideoModal();
  });

  const animatedItems = document.querySelectorAll(
    ".service-card, .gallery-item, .about-text, .about-image, .contact-card"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );

    animatedItems.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(30px)";
      item.style.transition = "all 0.7s ease";
      observer.observe(item);
    });
  } else {
    animatedItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    });
  }
});
```
