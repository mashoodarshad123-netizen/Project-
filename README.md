# Ghost Busting — Demo Static Site

Simple static website with a professional background, a sign-in page, and a registration page.

How to view locally:

1. Open the workspace folder in your file explorer.
2. Double-click `index.html` to open it in your browser (or right-click and choose "Open with" your browser).

Files added:
- `index.html` — Home / marketing page
- `signup.html` — Sign-in form (demo)
- `register.html` — Registration form (demo)
- `styles.css` — Styles and background
- `script.js` — Minimal client-side validation and demo handlers

Notes:
- This is a static demo. No backend or persistence is included.
- For production, connect the forms to a secure server, add CSRF protection, and use HTTPS.

Background image credit:
- Photo (used as background) — Unsplash: https://unsplash.com/ (royalty-free). If you prefer a local image, replace the URL in `styles.css` with a local file path like `images/haunted-house.jpg`.

Welcome sound:
- The site attempts to play a short welcome message on load. Modern browsers may block autoplay audio until a user interacts with the page; the script will play the message on the first click or keypress if blocked.

Backgrounds and customization:
- To change the site background, replace the image URL in `styles.css` (search for `background-image` near the top) with your image path, or save your image into an `images/` folder and use that path (for example `images/haunted-house.jpg`).

Note: I removed the in-page theme selector and upload control per your request — background changes are now manual (edit `styles.css` or replace the image file).
