# Mariposa Studio

A responsive website for Mariposa Studio, a Kenyan creative studio serving clients across all 47 counties. Built with HTML, CSS, and vanilla JavaScript, it introduces the studio, services, process, vision, working options, FAQs, and project inquiry flow. Visitors can switch on the studio welcome screen and use the floating contact launcher to prepare a message for the CEO, administration, or studio staff.

## Run locally

Open `index.html` in a browser, or serve this folder with any static file server. The page loads Tailwind CSS and the Inter font from external CDNs, so those resources require an internet connection.

## Before publishing

- In `script.js`, replace `CONTACT_EMAIL` with the inbox that should receive project inquiries. The contact form opens the visitor's default email app; it does not send data to a server.
- The welcome screen and team discussion launcher are client-side interactions. CEO, Administration, and Studio staff messages currently open as email drafts to `CONTACT_EMAIL`; update `DISCUSSION_EMAILS` in `script.js` if those teams use separate inboxes. They are not live chat or private authenticated rooms.
- Review all service descriptions and studio copy to ensure they match the real business. Working options are scope descriptions rather than fixed-price packages.
- The CEO portrait is stored locally as `ceo-photo.png` and displayed in the studio introduction section.
- Update the page title, description, and brand content as needed.

There is no build step or package installation required.
