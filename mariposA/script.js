const CONTACT_EMAIL = 'hello@mariposa.studio';
const DISCUSSION_EMAILS = {
  CEO: CONTACT_EMAIL,
  Administration: CONTACT_EMAIL,
  'Studio staff': CONTACT_EMAIL
};

const welcomeScreen = document.querySelector('#welcome-screen');
const lightSwitch = document.querySelector('#light-switch');

if (welcomeScreen && lightSwitch) {
  welcomeScreen.hidden = false;
  document.body.classList.add('studio-unlit');

  lightSwitch.addEventListener('click', () => {
    welcomeScreen.classList.add('is-lighting');
    document.body.classList.remove('studio-unlit');
    document.body.classList.add('studio-lit');
    window.setTimeout(() => {
      welcomeScreen.hidden = true;
      welcomeScreen.classList.remove('is-lighting');
    }, 420);
  });
}

const menuToggle = document.querySelector('#menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function setMenuOpen(isOpen) {
  if (!menuToggle || !mobileMenu) {
    return;
  }

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  mobileMenu.classList.toggle('hidden', !isOpen);
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setMenuOpen(false);
    }
  });
}

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get('name')).trim();
    const email = String(formData.get('email')).trim();
    const message = String(formData.get('message')).trim();
    const service = String(formData.get('service')).trim();
    const subject = encodeURIComponent(`Project inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nRequested support: ${service || 'Not sure yet'}\n\nProject details:\n${message}`);

    formStatus.textContent = 'Opening your email app to send the inquiry...';
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  });
}

const discussionToggle = document.querySelector('#discussion-toggle');
const discussionPanel = document.querySelector('#discussion-panel');
const discussionClose = document.querySelector('#discussion-close');
const discussionForm = document.querySelector('#discussion-form');
const discussionStatus = document.querySelector('#discussion-status');
const discussionRooms = document.querySelectorAll('.discussion-room');
let selectedDiscussionRoom = 'CEO';

function setDiscussionOpen(isOpen) {
  if (!discussionToggle || !discussionPanel) {
    return;
  }

  discussionPanel.hidden = !isOpen;
  discussionToggle.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    discussionPanel.querySelector('.discussion-room')?.focus();
  } else {
    discussionToggle.focus();
  }
}

if (discussionToggle && discussionPanel) {
  discussionToggle.addEventListener('click', () => {
    setDiscussionOpen(discussionToggle.getAttribute('aria-expanded') !== 'true');
  });

  discussionClose?.addEventListener('click', () => setDiscussionOpen(false));

  discussionRooms.forEach((roomButton) => {
    roomButton.addEventListener('click', () => {
      selectedDiscussionRoom = roomButton.dataset.room || 'CEO';
      discussionRooms.forEach((room) => {
        const isSelected = room === roomButton;
        room.classList.toggle('is-selected', isSelected);
        room.setAttribute('aria-pressed', String(isSelected));
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && discussionToggle.getAttribute('aria-expanded') === 'true') {
      setDiscussionOpen(false);
    }
  });
}

if (discussionForm && discussionStatus) {
  discussionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!discussionForm.reportValidity()) {
      return;
    }

    const message = String(new FormData(discussionForm).get('message')).trim();
    const recipient = DISCUSSION_EMAILS[selectedDiscussionRoom];
    const subject = encodeURIComponent(`Mariposa Studio — Message for ${selectedDiscussionRoom}`);
    const body = encodeURIComponent(`Please forward this message to: ${selectedDiscussionRoom}\n\n${message}`);

    discussionStatus.textContent = `Opening your email app to contact ${selectedDiscussionRoom}...`;
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}

const currentYear = document.querySelector('#current-year');
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}