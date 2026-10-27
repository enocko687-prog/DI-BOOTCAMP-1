# RemindDesk Assignment Tracker

A responsive assignment-tracking demo with student and teacher workspaces. It uses plain HTML, CSS, and JavaScript and has no package dependencies.

## Run in VS Code

1. Open this folder in VS Code.
2. Press **F5** and select **Run RemindDesk** to start the server and open the app; or choose **Terminal → Run Task → Start RemindDesk**.
3. If you prefer the terminal, run `npm start` and open [http://127.0.0.1:5173](http://127.0.0.1:5173).

You can also open `index.html` directly in a browser. Push notifications require a supported browser and a secure context; the local development server at `localhost` is supported.

## Included files

- `index.html` — app entry point and document metadata.
- `styles.css` — responsive dashboard and component styles.
- `app.js` — sample course data, views, and interactive behavior.
- `server.js` — dependency-free local development server.
- `package.json` — project metadata and the `npm start` command.

The app stores assignment changes, reminders, and preferences in browser local storage. Assignment submissions are simulated locally; no files or data are uploaded to a school system.
