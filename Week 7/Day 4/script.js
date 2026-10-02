document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navbar = document.querySelector('.navbar');
  const hero = document.querySelector('.hero');
  const topButton = document.querySelector('.floating-button');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navigationLinks = [...document.querySelectorAll('.nav-links a')];

  // Add a slim reading-progress indicator without changing the page markup.
  const progress = document.createElement('div');
  progress.setAttribute('aria-hidden', 'true');
  Object.assign(progress.style, {
    background: 'var(--gold)',
    height: '3px',
    left: '0',
    position: 'fixed',
    top: '0',
    transformOrigin: 'left center',
    transform: 'scaleX(0)',
    transition: reduceMotion ? 'none' : 'transform .15s ease-out',
    width: '100%',
    zIndex: '100'
  });
  document.body.append(progress);

  const updateScrollState = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressAmount = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progress.style.transform = `scaleX(${Math.min(progressAmount, 1)})`;

    if (topButton) {
      topButton.style.transition = reduceMotion ? 'none' : 'opacity .25s ease, transform .25s ease';
      topButton.style.opacity = window.scrollY > window.innerHeight * 0.7 ? '1' : '0';
      topButton.style.pointerEvents = window.scrollY > window.innerHeight * 0.7 ? 'auto' : 'none';
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      const offset = navbar ? navbar.offsetHeight + 16 : 16;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        behavior: reduceMotion ? 'auto' : 'smooth',
        top: targetPosition
      });
      history.replaceState(null, '', anchor.getAttribute('href'));
    });
  });

  // Keep the navigation aware of the section currently in view.
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isActive);
        link.style.color = isActive ? 'var(--gold)' : '';
      });
    });
  }, { rootMargin: '-25% 0px -60% 0px' });
  sections.forEach(section => sectionObserver.observe(section));

  // Reveal content as it enters the viewport, while leaving reduced-motion users untouched.
  if (!reduceMotion) {
    const revealItems = document.querySelectorAll('.section > *, .work-card, .project-card, .media-card, .social-media-card');
    revealItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(22px)';
      item.style.transition = `opacity .65s ease ${Math.min(index % 4, 3) * 70}ms, transform .65s ease ${Math.min(index % 4, 3) * 70}ms`;
    });

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  if (hero && !reduceMotion) {
    hero.addEventListener('pointermove', event => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      hero.style.backgroundPosition = `${50 + x * 1.5}% ${50 + y * 1.5}%, left center, right center`;
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.backgroundPosition = 'center, left center, right center';
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.onsubmit = event => {
      event.preventDefault();
      const button = contactForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.textContent = 'Message received';
      button.disabled = true;
      button.style.opacity = '.75';

      setTimeout(() => {
        contactForm.reset();
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
      }, 2400);
    };
  }
});