const icon = (name) => {
  const paths = {
    cap: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5M22 10v6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    sound: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 22c4.4 0 7-3.1 7-7 0-2.8-1.6-5.3-4-7-.2 2-1.1 3.2-2 4-1-3.5-3.4-5.8-5-7-0.1 3.5-3 6-3 10 0 3.9 2.7 7 7 7Z"/><path d="M12 22c-2 0-3.5-1.5-3.5-3.5 0-1.4 1-2.7 2.3-3.7.1 1.2.6 1.8 1.2 2.3.6-1.1 1.2-1.7 1.8-2.2.8 1 1.2 2.2 1.2 3.6 0 2-1.2 3.5-3 3.5Z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8"/>',
    building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4"/>',
    megaphone: '<path d="m3 11 18-5v12L3 13v-2Z"/><path d="m8 14 2 7h4l-3-8"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 16v4h16v-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    x: '<path d="m18 6-12 12M6 6l12 12"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="m8.2 13.5-1.2 8L12 19l5 2.5-1.2-8"/>',
    focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.9Z"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
};

const courses = [
  { code: "MATH 301", name: "Advanced Calculus & Optimization", teacher: "Prof. Marcus Davies", points: 100 },
  { code: "CS 240", name: "Data Structures & Algorithms", teacher: "Dr. Elena Rostova", points: 120 },
  { code: "CHEM 210", name: "Organic Chemistry & Reaction Synthesis", teacher: "Dr. Sarah Chen", points: 75 },
  { code: "HIST 180", name: "Global History & International Policy", teacher: "Prof. Arthur Vance", points: 150 },
];

const initialTasks = [
  { id: "math4", course: "MATH 301", title: "Problem Set 4: Lagrange Multipliers & Constrained Extrema", description: "Solve questions 1 through 8 in Chapter 14. Be sure to show step-by-step Hessian determinant calculations and verify boundary critical points.", due: "Today at 5:11 PM", time: "4h 29m left", hours: 4.5, points: 100, progress: 40, milestones: ["Derive partial derivatives for f(x, y, z)", "Set up Lagrangian equation system with multiplier λ"], status: "pending", alerts: 2, submissions: 3, broadcasts: 2 },
  { id: "cs5", course: "CS 240", title: "Lab 5: Balanced Red-Black Tree Implementation", description: "Implement node insertion, color fixups, left and right tree rotations in TypeScript or Java. Include unit test coverage with at least 15 edge cases.", due: "Tomorrow at 10:41 AM", time: "Due today (21h left)", hours: 21, points: 120, progress: 75, milestones: ["Create Node model with color enum (RED/BLACK)", "Implement rotateLeft and rotateRight pointer shifts"], status: "pending", alerts: 1, submissions: 1, broadcasts: 1 },
  { id: "chem", course: "CHEM 210", title: "Spectroscopy Analysis: NMR & Infrared Identification", description: "Analyze the 3 unknown compound spectra sheets provided. Identify the functional groups, molecular formulas, and proposed structural isomers.", due: "Oct 29 at 12:41 PM", time: "Due tomorrow (47h left)", hours: 47, points: 75, status: "pending", alerts: 0, submissions: 1, broadcasts: 0 },
  { id: "hist", course: "HIST 180", title: "Policy Brief: The Post-WWII Bretton Woods Monetary Framework", description: "Write a 1,500-word comparative brief examining how the Bretton Woods system shaped international currency stability and developing economy reserves.", due: "Oct 31 at 12:41 PM", time: "3 days left", hours: 72, points: 150, status: "pending", alerts: 0, submissions: 0, broadcasts: 0 },
  { id: "math3", course: "MATH 301", title: "Problem Set 3: Gradient Vector Fields & Line Integrals", description: "Compute conservative vector field potential functions and verify Green’s theorem over smooth closed Jordan curves.", due: "Oct 26 at 6:41 AM", time: "Overdue by 1d 6h", hours: -30, points: 100, status: "submitted", alerts: 1, submissions: 5, broadcasts: 1 },
];

const rosterByCourse = {
  "MATH 301": [
    { name: "Jordan Smith", email: "jordan.s@campus.edu", status: "Turned In", when: "3h ago" },
    { name: "Samantha Vance", email: "sam.vance@campus.edu", status: "Turned In", when: "1h ago" },
    { name: "Alex Rivera", email: "alex.rivera@campus.edu", status: "Pending" },
    { name: "Marcus Taylor", email: "m.taylor@campus.edu", status: "Pending" },
    { name: "Priya Patel", email: "priya.p@campus.edu", status: "Turned In", when: "4h ago" },
    { name: "Ethan Hunt", email: "ethan.h@campus.edu", status: "Pending" },
  ],
  "CS 240": [
    { name: "Jordan Smith", email: "jordan.s@campus.edu", status: "Pending" },
    { name: "Samantha Vance", email: "sam.vance@campus.edu", status: "Pending" },
    { name: "Alex Rivera", email: "alex.rivera@campus.edu", status: "Turned In", when: "2h ago" },
    { name: "Marcus Taylor", email: "m.taylor@campus.edu", status: "Pending" },
    { name: "Priya Patel", email: "priya.p@campus.edu", status: "Pending" },
    { name: "Ethan Hunt", email: "ethan.h@campus.edu", status: "Pending" },
  ],
  "CHEM 210": ["Jordan Smith", "Samantha Vance", "Alex Rivera", "Marcus Taylor", "Priya Patel", "Ethan Hunt"].map((name) => ({ name, email: `${name.split(" ")[0].toLowerCase()}@campus.edu`, status: "Pending" })),
  "HIST 180": ["Jordan Smith", "Samantha Vance", "Alex Rivera", "Marcus Taylor", "Priya Patel", "Ethan Hunt"].map((name) => ({ name, email: `${name.split(" ")[0].toLowerCase()}@campus.edu`, status: "Pending" })),
};

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("reminddesk-state") || "{}"); } catch (error) {
    console.error("Could not read saved RemindDesk preferences.", error);
    return {};
  }
})();
const state = {
  mode: saved.mode === "teacher" ? "teacher" : "student",
  page: saved.page || "assignments",
  filter: "all",
  course: "all",
  view: "list",
  offline: false,
  sound: saved.sound !== false,
  acknowledged: saved.acknowledged === true,
  notificationsOpen: false,
  tasks: Array.isArray(saved.tasks) ? [
    ...initialTasks.map((task) => ({ ...task, ...(saved.tasks.find((savedTask) => savedTask.id === task.id) || {}) })),
    ...saved.tasks.filter((task) => !initialTasks.some((item) => item.id === task.id)),
  ] : initialTasks.map((task) => ({ ...task })),
  broadcasts: saved.broadcasts || [
    { title: "Reminder: Problem Set 4 due tonight at 11:59 PM", course: "MATH 301", age: "2h ago", message: "Friendly reminder that Problem Set 4 is due in just a few hours. Remember that Question 7 requires checking second-order Hessian conditions. Office hours are open until 4 PM in Hall 304 if you need guidance!", audience: "Pending Only", level: "high" },
    { title: "Lab 5: Test Harness & Autograder Live", course: "CS 240", age: "10h ago", message: "The automated autograder branch has been updated with the 15 required stress test cases. Ensure all red-black tree insertion invariants pass before submitting tomorrow evening.", audience: "Entire Class", level: "standard" },
  ],
};

const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const courseFor = (code) => courses.find((course) => course.code === code) || courses[0];
const save = () => {
  try {
    localStorage.setItem("reminddesk-state", JSON.stringify({ mode: state.mode, page: state.page, sound: state.sound, acknowledged: state.acknowledged, tasks: state.tasks, broadcasts: state.broadcasts }));
  } catch (error) { console.error("Could not save RemindDesk preferences.", error); }
};
const toast = (message) => {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  toastRegion.append(node);
  window.setTimeout(() => node.remove(), 3500);
};
const studentTasks = () => state.tasks.filter((task) => {
  const filterMatches = state.filter === "all" || (state.filter === "due" && task.status === "pending" && task.hours < 24) || (state.filter === "submitted" && task.status === "submitted");
  return filterMatches && (state.course === "all" || task.course === state.course);
});
const courseOptions = () => `<option value="all">All Courses</option>${courses.map((course) => `<option value="${escapeHtml(course.code)}" ${state.course === course.code ? "selected" : ""}>${escapeHtml(course.code)}</option>`).join("")}`;
const navItems = [["assignments", "Assignments"], ["schedule", "Schedule"], ["teacher", "Teacher Portal"], ["preferences", "Preferences"]];
const appHeader = () => `
  <header class="topbar">
    <a class="brand" href="#" data-page="assignments" aria-label="RemindDesk home">
      <span class="brand-mark">${icon("cap")}</span><span class="brand-name">Remind<span>Desk</span></span>
    </a>
    <div class="top-actions">
      <button class="connection-button ${state.offline ? "offline" : ""}" data-action="offline" title="${state.offline ? "Offline — click to reconnect" : "Network connected — click to simulate offline mode"}" aria-label="${state.offline ? "Reconnect network" : "Simulate offline mode"}"><span class="connection-dot"></span></button>
      <button class="icon-button sound-button" data-action="sound" title="${state.sound ? "Mute reminder chimes" : "Enable reminder chimes"}" aria-label="${state.sound ? "Mute sound" : "Enable sound"}">${icon("sound")}</button>
      <button class="icon-button" data-action="notifications" title="Notifications" aria-label="Notifications">${icon("bell")}<span class="notification-count">${state.broadcasts.length + 1}</span></button>
      <div class="mode-switch" aria-label="Choose workspace">
        <button class="${state.mode === "student" ? "active" : ""}" data-mode="student">${icon("cap")} Student</button>
        <button class="${state.mode === "teacher" ? "active" : ""}" data-mode="teacher">${icon("building")} Teacher</button>
      </div>
    </div>
    ${state.notificationsOpen ? notificationPopover() : ""}
  </header>
  <nav class="nav-bar" aria-label="Main navigation">
    ${navItems.map(([key, label]) => `<button class="nav-link ${state.page === key ? "active" : ""}" data-page="${key}">${label}</button>`).join("")}
  </nav>`;

function notificationPopover() {
  return `<aside class="popover"><h3>Notifications</h3>
    <div class="notification-item"><strong>Problem Set 4 needs attention</strong>Due tonight — remember to review Question 7.</div>
    ${state.broadcasts.slice(0, 2).map((item) => `<div class="notification-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.age)} · ${escapeHtml(item.course)}</div>`).join("")}
    <button class="button subtle small" data-action="clear-notifications">Mark all as read</button></aside>`;
}

function renderStudent() {
  const pendingCount = state.tasks.filter((task) => task.status === "pending").length;
  const turnedInCount = state.tasks.filter((task) => task.status === "submitted").length;
  const earnedPoints = state.tasks.filter((task) => task.status === "submitted").reduce((total, task) => total + task.points, 0);
  const totalPoints = state.tasks.reduce((total, task) => total + task.points, 0);
  const filtered = studentTasks();
  const urgent = state.tasks.find((task) => task.status === "pending" && task.hours > 0) || state.tasks[0];
  return `<main class="page">
    <div class="eyebrow"><strong>Student Workspace</strong><span>·</span><span>Alex Rivera (Junior)</span><span>·</span><span>Fall Semester 2026</span></div>
    <h1>Coursework Deadlines &amp; Tasks</h1>
    <p class="push-line">Push Reminders: <button class="text-button" data-action="push">Enable Push Alerts</button></p>
    <hr class="section-divider">
    ${state.acknowledged ? "" : `<section class="reminder-card" aria-label="Instructor reminder">
      <div class="reminder-icon">${icon("megaphone")}</div>
      <div>
        <div class="reminder-meta"><strong>Prof. Marcus Davies</strong><span>·</span><span>Advanced Calculus &amp; Optimization</span><span>·</span><span>2h ago</span></div>
        <span class="badge">Action Required</span>
        <p class="reminder-title">Reminder: Problem Set 4 due tonight at 11:59 PM</p>
        <p class="reminder-copy">Friendly reminder that Problem Set 4 is due in just a few hours. Remember that Question 7 requires checking second-order Hessian conditions. Office hours are open until 4 PM in Hall 304 if you need guidance!</p>
        <a class="related-link" href="#task-math4" data-action="focus-task" data-task="math4">Related: Problem Set 4: Lagrange Multipliers &amp; Constrained Extrema ${icon("arrow")}</a>
        <div class="reminder-footer"><button class="button acknowledge" data-action="acknowledge">${icon("check")} Acknowledge</button></div>
      </div>
    </section>`}
    <section class="stats-grid" aria-label="Assignment summary">
      <article class="card stat-card"><div class="stat-top"><span>Pending Tasks</span><span class="stat-icon">${icon("clock")}</span></div><strong class="stat-value">${pendingCount}</strong><span class="stat-note">Across 4 enrolled courses</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Due in &lt; 24h</span><span class="stat-icon gold-icon">${icon("flame")}</span></div><strong class="stat-value">${state.tasks.filter((task) => task.status === "pending" && task.hours < 24).length}</strong><span class="stat-note">Push notifications active</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Turned In</span><span class="stat-icon green-icon">${icon("check")}</span></div><strong class="stat-value">${turnedInCount}</strong><span class="stat-note">20% submitted on time</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Total Rubric Pts</span><span class="stat-icon gold-icon">${icon("award")}</span></div><strong class="stat-value">${earnedPoints}/${totalPoints}</strong><span class="stat-note">${earnedPoints} pts earned</span></article>
    </section>
    <section class="focus-card">
      <div><span class="focus-label">HIGHEST DEADLINE PRIORITY</span><p class="focus-task-title"><strong>${escapeHtml(urgent.course)}</strong><span class="eyebrow">· ${escapeHtml(urgent.time)}</span></p><p class="focus-subtitle">${escapeHtml(urgent.title)}</p></div>
      <div class="focus-actions"><button class="button gold" data-action="focus" data-task="${escapeHtml(urgent.id)}">${icon("focus")} Focus This Task</button></div>
    </section>
    <div class="toolbar">
      <div class="filter-tabs" role="group" aria-label="Filter assignments">
        <button class="${state.filter === "all" ? "active" : ""}" data-filter="all">All Tasks (${state.tasks.length})</button>
        <button class="${state.filter === "due" ? "active" : ""}" data-filter="due">Due Soon (&lt; 24h)</button>
        <button class="${state.filter === "submitted" ? "active" : ""}" data-filter="submitted">Turned In</button>
      </div>
      <div class="toolbar-right"><select class="select" data-action="course-filter" aria-label="Filter by course">${courseOptions()}</select><div class="view-switch"><button class="${state.view === "list" ? "active" : ""}" data-view="list">List</button><button class="${state.view === "kanban" ? "active" : ""}" data-view="kanban">Kanban Board</button><button class="${state.view === "timeline" ? "active" : ""}" data-view="timeline">Timeline</button></div></div>
    </div>
    ${state.view === "list" ? renderTaskList(filtered) : state.view === "kanban" ? renderKanban(filtered) : renderTimeline(filtered)}
    ${renderFooter()}
  </main>`;
}

function renderTaskList(tasks) {
  if (!tasks.length) return `<div class="card empty-state">No assignments match these filters.</div>`;
  return `<section class="task-list">${tasks.map((task) => {
    const course = courseFor(task.course);
    return `<article class="card task-card ${task.status === "submitted" ? "done" : ""}" id="task-${escapeHtml(task.id)}">
      <div>
        <div class="task-heading"><span class="course-code">${escapeHtml(task.course)}</span><span>·</span><span>${escapeHtml(course.name)}</span><span>·</span><span>${task.points} pts</span></div>
        <h2 class="task-title">${escapeHtml(task.title)}</h2>
        <p class="task-description">${escapeHtml(task.description)}</p>
        ${task.progress ? `<div class="progress-wrap"><div class="progress-label"><span>Milestone Subtasks (2/5)</span><strong>${task.progress}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${task.progress}%"></div></div><div class="milestones">${task.milestones.map((item) => `<span class="milestone">${escapeHtml(item)}</span>`).join("")}</div></div>` : ""}
        <div class="task-footer"><span class="task-due ${task.hours < 0 ? "overdue" : ""}">Due: ${escapeHtml(task.due)}</span><span class="separator">·</span><span>${escapeHtml(course.teacher)}</span>${task.alerts ? `<span class="separator">·</span><span>${task.alerts} alert${task.alerts > 1 ? "s" : ""}</span>` : ""}${task.status === "submitted" ? `<span class="badge">Submitted &amp; Verified</span>` : ""}</div>
      </div>
      <div class="task-actions">${task.status === "pending" ? `<button class="button secondary small" data-action="focus" data-task="${escapeHtml(task.id)}">${icon("focus")} Focus Sprint</button><button class="button secondary small" data-action="remind" data-task="${escapeHtml(task.id)}">${icon("bell")} Remind</button><button class="button small" data-action="submit" data-task="${escapeHtml(task.id)}">${icon("upload")} Submit Task</button>` : `<button class="button secondary small" data-action="submission" data-task="${escapeHtml(task.id)}">Submission Details</button>`}</div>
    </article>`;
  }).join("")}</section>`;
}

function renderKanban(tasks) {
  const columns = [["pending", "To Do"], ["submitted", "Submitted"], ["overdue", "Overdue"]];
  return `<section class="kanban-grid">${columns.map(([key, label]) => {
    const items = tasks.filter((task) => key === "overdue" ? task.status === "pending" && task.hours < 0 : key === "pending" ? task.status === "pending" && task.hours >= 0 : task.status === key);
    return `<div class="kanban-column"><h3>${label} <span class="stat-note">(${items.length})</span></h3>${items.length ? items.map((task) => `<article class="kanban-card"><span class="course-code">${escapeHtml(task.course)}</span><strong>${escapeHtml(task.title)}</strong><span class="task-due">${escapeHtml(task.time)}</span><p><button class="button secondary small" data-action="${task.status === "pending" ? "submit" : "submission"}" data-task="${escapeHtml(task.id)}">${task.status === "pending" ? "Submit Task" : "View submission"}</button></p></article>`).join("") : `<p class="stat-note">Nothing here yet</p>`}</div>`;
  }).join("")}</section>`;
}

function renderTimeline(tasks) {
  const sorted = [...tasks].sort((a, b) => a.hours - b.hours);
  return `<section class="card timeline">${sorted.map((task) => `<div class="timeline-item"><div class="timeline-date">${escapeHtml(task.due.split(" at ")[0])}</div><div class="timeline-rail"></div><div class="timeline-content"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.course)} · ${escapeHtml(task.time)} · ${task.points} pts</span></div></div>`).join("") || `<div class="empty-state">No tasks to show.</div>`}</section>`;
}

function renderTeacher() {
  const active = state.tasks.filter((task) => task.status === "pending").length;
  const totalSubmitted = state.tasks.reduce((sum, task) => sum + (task.submissions || 0), 0);
  return `<main class="page">
    <div class="eyebrow"><strong>Faculty Command</strong><span>·</span><span>Instructor Dashboard</span><span>·</span><span>Fall Semester 2026</span></div>
    <h1>Instructor Assignment &amp; Reminder Portal</h1>
    <p class="push-line">Push Reminders: <button class="text-button" data-action="push">Enable Push Alerts</button></p>
    <section class="stats-grid teacher-stats">
      <article class="card stat-card"><div class="stat-top"><span>Active Courses</span><span class="stat-icon">${icon("book")}</span></div><strong class="stat-value">4</strong><span class="stat-note">6 students actively enrolled</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Class Turn-In Rate</span><span class="stat-icon green-icon">${icon("users")}</span></div><strong class="stat-value">33%</strong><span class="stat-note">10 of 30 tasks submitted</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Managed Tasks</span><span class="stat-icon gold-icon">${icon("calendar")}</span></div><strong class="stat-value">${state.tasks.length}</strong><span class="stat-note">Across current academic term</span></article>
      <article class="card stat-card"><div class="stat-top"><span>Broadcasts Sent</span><span class="stat-icon">${icon("megaphone")}</span></div><strong class="stat-value">${state.broadcasts.length}</strong><span class="stat-note">Web push + lock-screen alerts</span></article>
    </section>
    <section class="teacher-banner"><h2>Instructor Coursework &amp; Push Command</h2><p>Broadcast instant push reminders to students, nudge pending submissions, and publish upcoming tasks.</p><div class="teacher-actions"><button class="button gold" data-action="broadcast-all">${icon("send")} Remind Students</button><button class="button secondary" data-action="new-task">${icon("plus")} New Task</button></div></section>
    <div class="toolbar"><div class="filter-tabs">${courses.map((course) => `<button class="${state.course === course.code ? "active" : ""}" data-teacher-course="${escapeHtml(course.code)}">${escapeHtml(course.code)}</button>`).join("")}</div><div class="toolbar-right"><button class="button secondary small" data-action="teacher-all">All Courses</button></div></div>
    <section class="task-list">${state.tasks.filter((task) => state.course === "all" || task.course === state.course).map((task) => renderTeacherTask(task)).join("") || `<div class="card empty-state">No assignments for this course yet.</div>`}</section>
    <div class="subheading"><h2>Recent Reminders &amp; Push Broadcasts</h2><span class="badge">${state.broadcasts.length} dispatched</span></div>
    <section class="broadcast-list">${state.broadcasts.slice(0, 5).map((item) => `<article class="card broadcast-card"><strong>${escapeHtml(item.title)}</strong><div class="broadcast-meta"><span>${escapeHtml(courseFor(item.course).name)}</span><span>·</span><span>${escapeHtml(item.age)}</span></div><p>${escapeHtml(item.message)}</p><div class="broadcast-meta"><span class="badge">${escapeHtml(item.audience)}</span><span class="badge">${escapeHtml(item.level)}</span></div></article>`).join("")}</section>
    ${renderFooter()}
  </main>`;
}

function renderTeacherTask(task) {
  const course = courseFor(task.course);
  const roster = rosterByCourse[task.course] || [];
  const pending = roster.filter((student) => student.status === "Pending").length;
  return `<article class="card teacher-task-card">
    <div class="teacher-task-head"><div><div class="task-heading"><span class="course-code">${escapeHtml(task.course)}</span><span>·</span><span>${escapeHtml(course.name)}</span><span>·</span><span>${task.points} pts</span></div><h3>${escapeHtml(task.title)}</h3><div class="teacher-task-meta"><span>Due: ${escapeHtml(task.due)}</span><span>·</span><strong>${task.submissions || 0} of 6 submitted (${Math.round((task.submissions || 0) / 6 * 100)}%)</strong><span>·</span><span>${task.broadcasts || 0} broadcast${task.broadcasts === 1 ? "" : "s"} sent</span></div></div>
      <button class="button secondary small" data-action="remind-course" data-task="${escapeHtml(task.id)}">${icon("send")} Remind ${pending} Pending</button>
    </div>
    <details class="roster"><summary><strong>Roster (6)</strong></summary><p class="roster-summary">Student Submission Roster &amp; Individual Nudges · ${pending} students have not submitted yet</p><div class="roster-list">${roster.map((student) => `<div class="roster-row"><span class="avatar">${escapeHtml(student.name[0])}</span><div class="roster-info"><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.email)}</span></div>${student.status === "Pending" ? `<button class="button secondary small" data-action="nudge" data-name="${escapeHtml(student.name)}" data-course="${escapeHtml(task.course)}">Nudge</button>` : `<span class="roster-status">${escapeHtml(student.status)}${student.when ? ` · ${escapeHtml(student.when)}` : ""}</span>`}</div>`).join("")}</div></details>
  </article>`;
}

function renderSchedule() {
  const upcoming = [...state.tasks].filter((task) => task.status === "pending").sort((a, b) => a.hours - b.hours);
  return `<main class="page"><div class="eyebrow"><strong>Student Workspace</strong><span>·</span><span>Fall Semester 2026</span></div><h1>Course Schedule</h1><p class="push-line">Your upcoming coursework deadlines, in order.</p>
    <div class="schedule-controls"><button class="button secondary small" data-action="schedule-today">${icon("calendar")} Upcoming assignments</button><select class="select" data-action="course-filter" aria-label="Filter by course">${courseOptions()}</select></div>
    <section class="card" style="padding: 8px 22px">${upcoming.filter((task) => state.course === "all" || task.course === state.course).map((task) => `<div class="schedule-day"><div class="schedule-day-label">${escapeHtml(task.due)}</div><div><div class="schedule-entry"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.course)} · ${task.points} points · ${escapeHtml(task.time)}</span></div></div></div>`).join("") || `<div class="empty-state">No upcoming deadlines for this course.</div>`}</section>${renderFooter()}</main>`;
}

function renderPreferences() {
  return `<main class="page"><div class="eyebrow"><strong>Student Workspace</strong><span>·</span><span>Account settings</span></div><h1>Preferences &amp; Notifications</h1><p class="push-line">Choose how RemindDesk keeps you up to date.</p>
    <section class="card preferences">
      <div class="preference-row"><div><strong>Push notifications</strong><span>Get assignment reminders on this device.</span></div><button class="button secondary small" data-action="push">Enable Push Alerts</button></div>
      <div class="preference-row"><div><strong>Sound chimes</strong><span>Play a short audio cue for new reminders.</span></div><button class="switch ${state.sound ? "on" : ""}" data-action="sound" role="switch" aria-checked="${state.sound}" aria-label="Toggle sound"></button></div>
      <div class="preference-row"><div><strong>Offline mode</strong><span>Simulate a disconnected network connection.</span></div><button class="switch ${state.offline ? "on" : ""}" data-action="offline" role="switch" aria-checked="${state.offline}" aria-label="Toggle offline mode"></button></div>
      <div class="preference-row"><div><strong>Current workspace</strong><span>Switch between the student and instructor dashboards.</span></div><div class="focus-actions"><button class="button secondary small" data-mode="student">Student</button><button class="button secondary small" data-mode="teacher">Teacher</button></div></div>
    </section>${renderFooter()}</main>`;
}

function renderFooter() {
  return `<footer class="footer"><strong>RemindDesk</strong> · Assignment Tracker &amp; Classroom Push Notifications<br><span>Real-time Audio Chimes</span><span class="dot">·</span><span>Lock-screen Web Push</span><span class="dot">·</span><span>Zero-pill Architecture</span></footer>`;
}

function render() {
  const content = state.page === "schedule" ? renderSchedule() : state.page === "preferences" ? renderPreferences() : state.mode === "teacher" || state.page === "teacher" ? renderTeacher() : renderStudent();
  app.innerHTML = `${appHeader()}${content}`;
  if (state.page === "teacher") state.mode = "teacher";
  save();
}

function openModal(title, body) {
  document.querySelector(".modal-backdrop")?.remove();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><h2 id="modal-title">${title}</h2><button class="close-button" data-action="close-modal" aria-label="Close dialog">×</button></header><div class="modal-body">${body}</div></section>`;
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) backdrop.remove(); });
  document.body.append(backdrop);
  backdrop.querySelector("button, input, textarea, select")?.focus();
}

function submitDialog(task) {
  openModal("Submit assignment", `<p class="task-description"><strong>${escapeHtml(task.title)}</strong><br>${escapeHtml(task.course)} · ${task.points} points · Due ${escapeHtml(task.due)}</p><form id="submit-form"><div class="field"><label for="submission-note">Submission note</label><textarea id="submission-note" placeholder="Add a note for your instructor (optional)"></textarea></div><div class="field"><label for="submission-file">Attach a file</label><input id="submission-file" type="file" accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg"></div><p class="stat-note">Demo mode: submission status is saved in this browser.</p><div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">Cancel</button><button type="submit" class="button">${icon("upload")} Submit assignment</button></div></form>`);
  document.querySelector("#submit-form").addEventListener("submit", (event) => {
    event.preventDefault();
    task.status = "submitted";
    task.submissions = Math.min(6, (task.submissions || 0) + 1);
    document.querySelector(".modal-backdrop").remove();
    save(); render(); toast("Assignment submitted successfully.");
  });
}

function newTaskDialog() {
  openModal("Create a new assignment", `<form id="new-task-form">
    <div class="field"><label for="new-title">Assignment title</label><input id="new-title" name="title" required maxlength="120" placeholder="e.g. Chapter 6 problem set"></div>
    <div class="field"><label for="new-course">Course</label><select id="new-course" name="course">${courses.map((course) => `<option value="${escapeHtml(course.code)}">${escapeHtml(course.code)} — ${escapeHtml(course.name)}</option>`).join("")}</select></div>
    <div class="field"><label for="new-due">Due date</label><input id="new-due" name="due" type="datetime-local" required></div>
    <div class="field"><label for="new-points">Points</label><input id="new-points" name="points" type="number" min="1" max="1000" value="100" required></div>
    <div class="field"><label for="new-description">Instructions</label><textarea id="new-description" name="description" required placeholder="Describe the work students need to complete."></textarea></div>
    <div class="modal-actions"><button type="button" class="button secondary" data-action="close-modal">Cancel</button><button type="submit" class="button">Publish assignment</button></div>
  </form>`);
  document.querySelector("#new-task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const due = new Date(String(form.get("due")));
    const task = { id: `task-${Date.now()}`, course: String(form.get("course")), title: String(form.get("title")).trim(), description: String(form.get("description")).trim(), due: due.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }), time: "Upcoming", hours: Math.max(1, (due.getTime() - Date.now()) / 3600000), points: Number(form.get("points")), status: "pending", alerts: 0, submissions: 0, broadcasts: 0 };
    if (!task.title || !task.description || Number.isNaN(due.getTime()) || task.points < 1) return toast("Please enter a valid title, due date, instructions, and points.");
    state.tasks.unshift(task);
    state.mode = "teacher";
    state.page = "teacher";
    document.querySelector(".modal-backdrop").remove();
    save(); render(); toast("Assignment published to the course.");
  });
}

function startFocus(task) {
  openModal("Focus sprint", `<p class="timer-caption">${escapeHtml(task.title)}</p><div class="timer-display" id="timer-display">25:00</div><p class="timer-caption">A focused 25-minute session. You can pause or stop any time.</p><div class="modal-actions" style="justify-content:center"><button class="button secondary" data-action="close-modal">End sprint</button><button class="button gold" data-action="timer-toggle">Start focus</button></div>`);
}

let timerInterval;
let timerSeconds = 1500;
let timerRunning = false;
function toggleTimer(button) {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    button.textContent = "Resume focus";
    return;
  }
  timerRunning = true;
  button.textContent = "Pause sprint";
  timerInterval = window.setInterval(() => {
    timerSeconds -= 1;
    const display = document.querySelector("#timer-display");
    if (!display) { clearInterval(timerInterval); timerRunning = false; return; }
    display.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:${String(timerSeconds % 60).padStart(2, "0")}`;
    if (timerSeconds <= 0) { clearInterval(timerInterval); timerRunning = false; toast("Focus sprint complete — nice work!"); }
  }, 1000);
}

function pushPermission() {
  if (!("Notification" in window)) return toast("Push notifications are not supported by this browser.");
  if (Notification.permission === "granted") return toast("Push alerts are enabled for this browser.");
  if (Notification.permission === "denied") return toast("Notifications are blocked. Allow them in your browser settings.");
  Notification.requestPermission().then((permission) => toast(permission === "granted" ? "Push alerts enabled." : "Push alerts were not enabled."));
}

function playChime() {
  if (!state.sound) return;
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = 660;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + 0.3);
    oscillator.onended = () => audio.close();
  } catch (error) { console.error("Could not play reminder sound.", error); toast("Sound could not be played by this browser."); }
}

function dispatchReminder(task, audience = "Pending Only") {
  const course = courseFor(task.course);
  const pendingCount = (rosterByCourse[task.course] || []).filter((person) => person.status === "Pending").length;
  if (!pendingCount && audience === "Pending Only") return toast("Everyone has submitted this assignment.");
  const now = new Date();
  state.broadcasts.unshift({
    title: `Reminder: ${task.title}`,
    course: task.course,
    age: "Just now",
    message: `A reminder about ${task.title} for ${course.name}. Due ${task.due}.`,
    audience: audience === "Pending Only" ? `${pendingCount} pending students` : "Entire Class",
    level: "standard",
  });
  task.broadcasts = (task.broadcasts || 0) + 1;
  task.alerts = (task.alerts || 0) + 1;
  save(); render(); toast(`Reminder sent to ${audience === "Pending Only" ? `${pendingCount} pending students` : "the whole class"}.`);
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button, a");
  if (!button) return;
  if (button.matches("[data-mode]")) {
    state.mode = button.dataset.mode;
    state.page = state.mode === "teacher" ? "teacher" : "assignments";
    state.course = "all"; state.notificationsOpen = false;
    render(); return;
  }
  if (button.matches("[data-page]")) {
    event.preventDefault();
    state.page = button.dataset.page;
    state.mode = state.page === "teacher" ? "teacher" : "student";
    state.notificationsOpen = false;
    render(); return;
  }
  if (button.matches("[data-filter]")) { state.filter = button.dataset.filter; render(); return; }
  if (button.matches("[data-view]")) { state.view = button.dataset.view; render(); return; }
  if (button.matches("[data-teacher-course]")) { state.course = state.course === button.dataset.teacherCourse ? "all" : button.dataset.teacherCourse; render(); return; }
  if (!button.matches("[data-action]")) return;
  const task = state.tasks.find((item) => item.id === button.dataset.task);
  switch (button.dataset.action) {
    case "offline":
      state.offline = !state.offline;
      render();
      toast(state.offline ? "Offline mode enabled — changes stay on this device." : "Connection restored.");
      break;
    case "sound":
      state.sound = !state.sound; save(); render(); toast(state.sound ? "Reminder sound enabled." : "Reminder sound muted.");
      break;
    case "notifications": state.notificationsOpen = !state.notificationsOpen; render(); break;
    case "clear-notifications": state.notificationsOpen = false; render(); toast("Notifications marked as read."); break;
    case "push": pushPermission(); break;
    case "acknowledge": state.acknowledged = true; save(); render(); toast("Reminder acknowledged."); break;
    case "focus":
      if (task) { timerSeconds = 1500; timerRunning = false; startFocus(task); }
      break;
    case "focus-task":
      event.preventDefault();
      state.filter = "all"; state.course = "all"; state.view = "list"; state.page = "assignments"; state.mode = "student"; render();
      window.setTimeout(() => document.getElementById(`task-${button.dataset.task}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      break;
    case "submit": if (task) submitDialog(task); break;
    case "submission": if (task) openModal("Submission details", `<h3>${escapeHtml(task.title)}</h3><p class="task-description">Status: Submitted &amp; Verified<br>Course: ${escapeHtml(task.course)}<br>Due: ${escapeHtml(task.due)}</p><p>Your assignment has been received. Your instructor will review it and post feedback here.</p><div class="modal-actions"><button class="button" data-action="close-modal">Done</button></div>`); break;
    case "remind": if (task) toast(`Reminder set for “${task.title}”.`); break;
    case "new-task": newTaskDialog(); break;
    case "broadcast-all": {
      const taskToRemind = state.tasks.find((item) => item.status === "pending");
      if (taskToRemind) dispatchReminder(taskToRemind, "Entire Class");
      else toast("There are no active assignments to remind students about.");
      break;
    }
    case "remind-course": if (task) dispatchReminder(task); break;
    case "nudge": {
      const taskToRemind = state.tasks.find((item) => item.course === button.dataset.course && item.status === "pending");
      if (taskToRemind) { dispatchReminder(taskToRemind); toast(`A personal nudge was sent to ${button.dataset.name}.`); }
      break;
    }
    case "teacher-all": state.course = "all"; render(); break;
    case "close-modal":
      clearInterval(timerInterval); timerRunning = false;
      document.querySelector(".modal-backdrop")?.remove();
      break;
    case "timer-toggle": toggleTimer(button); break;
    case "schedule-today": state.course = "all"; render(); break;
  }
});

app.addEventListener("change", (event) => {
  if (event.target.matches('[data-action="course-filter"]')) { state.course = event.target.value; render(); }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest(".modal-backdrop [data-action]");
  if (!button) return;
  if (button.dataset.action === "close-modal") {
    clearInterval(timerInterval);
    timerRunning = false;
    document.querySelector(".modal-backdrop")?.remove();
  } else if (button.dataset.action === "timer-toggle") {
    toggleTimer(button);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelector(".modal-backdrop")?.remove();
    if (state.notificationsOpen) { state.notificationsOpen = false; render(); }
    clearInterval(timerInterval); timerRunning = false;
  }
});

window.addEventListener("offline", () => { state.offline = true; render(); toast("Your device is offline."); });
window.addEventListener("online", () => { state.offline = false; render(); toast("Your connection is back."); });

render();
