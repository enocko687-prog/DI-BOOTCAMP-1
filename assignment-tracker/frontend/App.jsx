import { useEffect, useMemo, useRef, useState } from "react";

const subjects = [
    "Mathematics", "English", "Kiswahili", "Science",
    "Social Studies", "CRE", "Computer Studies", "Other"
];

const DEMO_MODE_KEY = "studyspace_demo_mode";
const DEMO_ROLE_KEY = "studyspace_demo_role";
const DEMO_DATA_KEY = "studyspace_demo_data";
const AUTHENTICATED_KEY = "studyspace_authenticated";
const DEMO_STUDENTS = [
    { id: "demo-student-1", email: "alex.student@example.com", role: "student" },
    { id: "demo-student-2", email: "jamie.student@example.com", role: "student" }
];

const roles = [
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher / trainer" },
    { value: "director", label: "Director" },
    { value: "admin", label: "Administrator" }
];

const learningMaterials = [
    { subject: "Study skills", title: "Break a big task into small steps", detail: "Start with the first ten minutes. Write down one small, clear action and begin there.", icon: "✦" },
    { subject: "Study skills", title: "Build a realistic weekly plan", detail: "Check your deadlines, choose a short study block for each subject, and leave room for breaks.", icon: "◷" },
    { subject: "Mathematics", title: "Practice with purpose", detail: "Try a problem before checking the example. Note the step that was hardest and ask for help.", icon: "＋" },
    { subject: "English", title: "Make reading notes that stick", detail: "After each section, write its main idea in your own words and list any new vocabulary.", icon: "Aa" },
    { subject: "Science", title: "Use questions to review", detail: "Turn your notes into questions. Answer from memory, then revisit the parts you missed.", icon: "◎" },
    { subject: "Computer Studies", title: "Learn by building", detail: "Practice a concept with a small project. Test one change at a time and record what you learn.", icon: "</>" }
];

function isDemoMode() {
    return window.localStorage.getItem(DEMO_MODE_KEY) === "true";
}

function seedDemoData() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const assignments = [
        { _id: "demo-math-pending", owner: "demo-student-1", title: "Fractions practice", subject: "Mathematics", dueDate: tomorrow.toISOString().slice(0, 10), status: "pending", completed: false },
        { _id: "demo-english-approved", owner: "demo-student-1", title: "Reading response", subject: "English", dueDate: nextWeek.toISOString().slice(0, 10), status: "approved", completed: true, feedback: "Clear and thoughtful work." },
        { _id: "demo-science-revision", owner: "demo-student-1", title: "Plant growth observation", subject: "Science", dueDate: nextWeek.toISOString().slice(0, 10), status: "revision_requested", completed: false, feedback: "Add one more observation and resubmit." },
        { _id: "demo-kiswahili-submitted", owner: "demo-student-1", title: "Insha ya wiki", subject: "Kiswahili", dueDate: nextWeek.toISOString().slice(0, 10), status: "submitted", completed: false, submittedAt: new Date().toISOString(), submissionNote: "Nimekamilisha kazi yangu." },
        { _id: "demo-social-submitted", owner: "demo-student-2", title: "Community map", subject: "Social Studies", dueDate: nextWeek.toISOString().slice(0, 10), status: "submitted", completed: false, submittedAt: new Date().toISOString(), submissionNote: "My map is ready for review." },
        { _id: "demo-computer-pending", owner: "demo-student-2", title: "Keyboard skills practice", subject: "Computer Studies", dueDate: nextWeek.toISOString().slice(0, 10), status: "pending", completed: false }
    ];
    return {
        users: [
            ...DEMO_STUDENTS,
            { id: "demo-teacher-1", email: "teacher@example.com", role: "teacher" },
            { id: "demo-admin-1", email: "admin@example.com", role: "admin" },
            { id: "demo-director-1", email: "director@example.com", role: "director" }
        ],
        assignments
    };
}

function getDemoData() {
    try {
        const saved = window.localStorage.getItem(DEMO_DATA_KEY);
        if (saved) return JSON.parse(saved);
    } catch {
        window.localStorage.removeItem(DEMO_DATA_KEY);
    }
    const data = seedDemoData();
    window.localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
    return data;
}

function saveDemoData(data) {
    window.localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

function getDemoUser(data = getDemoData()) {
    const role = window.localStorage.getItem(DEMO_ROLE_KEY) || "student";
    if (role === "student") return { ...data.users.find((account) => account.id === DEMO_STUDENTS[0].id), demo: true };
    const user = data.users.find((account) => account.role === role);
    return { ...user, demo: true };
}

function demoAssignment(assignment, data) {
    const student = data.users.find((account) => account.id === assignment.owner);
    const { owner, ...publicFields } = assignment;
    return { ...publicFields, studentEmail: student?.email || "" };
}

function demoSubjectProgress(data) {
    const students = data.users.filter((account) => account.role === "student");
    return {
        subjects,
        students: students.map((student) => ({
            studentId: student.id,
            email: student.email,
            subjects: subjects.map((subject) => {
                const matching = data.assignments.filter((assignment) => assignment.owner === student.id && assignment.subject === subject);
                const counts = { total: matching.length, pending: 0, submitted: 0, approved: 0, revision_requested: 0 };
                for (const assignment of matching) counts[assignment.status] = (counts[assignment.status] || 0) + 1;
                const status = counts.total === 0 ? "not_assigned"
                    : counts.pending > 0 ? "not_done"
                        : counts.revision_requested > 0 ? "changes_requested"
                            : counts.submitted > 0 ? "awaiting_review" : "done";
                return { subject, status, ...counts };
            })
        }))
    };
}

function demoDirectorReport(data) {
    const assignments = data.assignments;
    const count = (status) => assignments.filter((assignment) => assignment.status === status).length;
    const bySubject = Object.entries(assignments.reduce((counts, assignment) => {
        counts[assignment.subject] = (counts[assignment.subject] || 0) + 1;
        return counts;
    }, {})).map(([subject, total]) => ({ subject, count: total }));
    return {
        students: data.users.filter((account) => account.role === "student").length,
        assignments: { total: assignments.length, pending: count("pending"), submitted: count("submitted"), approved: count("approved"), revisionRequested: count("revision_requested") },
        bySubject
    };
}

async function demoApi(path, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    const data = getDemoData();
    const user = getDemoUser(data);
    const assignmentMatch = path.match(/^\/api\/assignments\/([^/]+)(?:\/review)?$/);

    if (path === "/api/auth/me") return { user };
    if (path === "/api/auth/logout") {
        window.localStorage.removeItem(DEMO_MODE_KEY);
        window.localStorage.removeItem(DEMO_ROLE_KEY);
        return {};
    }
    if (path === "/api/assignments" && method === "GET") {
        const visible = user.role === "student"
            ? data.assignments.filter((assignment) => assignment.owner === user.id)
            : data.assignments;
        return { assignments: visible.map((assignment) => demoAssignment(assignment, data)) };
    }
    if (path === "/api/assignments" && method === "POST") {
        const owner = user.role === "student" ? user.id : body.studentId;
        const student = data.users.find((account) => account.id === owner && account.role === "student");
        if (!student) throw new Error("Choose a student account for this assignment.");
        const assignment = {
            _id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            owner,
            title: body.title,
            subject: body.subject,
            dueDate: body.dueDate,
            status: "pending",
            completed: false
        };
        data.assignments.push(assignment);
        saveDemoData(data);
        return { assignment: demoAssignment(assignment, data) };
    }
    if (assignmentMatch && method === "PATCH" && !path.endsWith("/review")) {
        if (user.role !== "student") throw new Error("Only students can submit their own work for review.");
        const assignment = data.assignments.find((item) => item._id === assignmentMatch[1] && item.owner === user.id);
        if (!assignment || !["pending", "revision_requested"].includes(assignment.status)) throw new Error("This assignment is not available to submit.");
        assignment.status = "submitted";
        assignment.completed = false;
        assignment.submissionNote = body.submissionNote || "";
        assignment.submittedAt = new Date().toISOString();
        delete assignment.feedback;
        saveDemoData(data);
        return { assignment: demoAssignment(assignment, data) };
    }
    if (assignmentMatch && method === "POST" && path.endsWith("/review")) {
        if (!["teacher", "admin"].includes(user.role)) throw new Error("Only teachers and administrators can review work.");
        const assignment = data.assignments.find((item) => item._id === assignmentMatch[1] && item.status === "submitted");
        if (!assignment) throw new Error("Only submitted assignments can be reviewed.");
        assignment.status = body.decision;
        assignment.completed = body.decision === "approved";
        assignment.feedback = body.feedback || "";
        saveDemoData(data);
        return { assignment: demoAssignment(assignment, data) };
    }
    if (assignmentMatch && method === "DELETE") {
        if (user.role !== "admin") throw new Error("Administrator access is required.");
        data.assignments = data.assignments.filter((item) => item._id !== assignmentMatch[1]);
        saveDemoData(data);
        return {};
    }
    if (path === "/api/students" && method === "GET") {
        if (!["teacher", "admin"].includes(user.role)) throw new Error("Only staff can view students.");
        return { students: data.users.filter((account) => account.role === "student") };
    }
    if (path === "/api/students/progress" && method === "GET") {
        if (!["teacher", "admin"].includes(user.role)) throw new Error("Only staff can view individual student progress.");
        return demoSubjectProgress(data);
    }
    if (path === "/api/users" && method === "GET") {
        if (user.role !== "admin") throw new Error("Administrator access is required.");
        return { users: data.users };
    }
    const roleMatch = path.match(/^\/api\/users\/([^/]+)\/role$/);
    if (roleMatch && method === "PATCH") {
        if (user.role !== "admin") throw new Error("Administrator access is required.");
        const account = data.users.find((item) => item.id === roleMatch[1]);
        if (!account) throw new Error("Account not found.");
        account.role = body.role;
        saveDemoData(data);
        return { user: account };
    }
    if (path === "/api/director/overview" && method === "GET") {
        if (!["director", "admin"].includes(user.role)) throw new Error("Director or administrator access is required.");
        return demoDirectorReport(data);
    }
    throw new Error("This action is not available in the demo.");
}

async function api(path, options = {}) {
    if (isDemoMode()) return demoApi(path, options);
    const response = await fetch(path, {
        ...options,
        credentials: "same-origin",
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });
    const result = response.status === 204
        ? {}
        : await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(result.error || "Something went wrong. Please try again.");
        error.status = response.status;
        throw error;
    }
    return result;
}

function Icon({ name, className = "" }) {
    const common = {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        viewBox: "0 0 24 24"
    };
    const paths = {
        book: <><path d="M5 5.75A2.75 2.75 0 0 1 7.75 3H19v15H7.75A2.75 2.75 0 0 0 5 20.75v-15Z" /><path d="M5 6v14.75A2.25 2.25 0 0 1 7.25 18H19M9 7h6M9 10h6" /></>,
        grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
        tasks: <><path d="M8 5.5h10.5A1.5 1.5 0 0 1 20 7v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H8Z" /><path d="M8 3.5h8v4H8v-4ZM8 12h8M8 16h5" /></>,
        chart: <path d="M4 19.5V13m5 6.5V8m5 11.5v-5m5 5V4.5" strokeWidth="2" />,
        calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M7.5 3.5v4m9-4v4M3.5 10h17" /></>,
        clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
        check: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.3 2.3 4.8-4.8" /></>,
        alert: <><path d="M12 3.5 21 20H3l9-16.5Z" /><path d="M12 9v4m0 3h.01" /></>,
        search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
        people: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5v-1.3A4.2 4.2 0 0 1 7.7 14h2.6a4.2 4.2 0 0 1 4.2 4.2v1.3M16 4.9a3.2 3.2 0 0 1 0 6.2m2.2 3a4.2 4.2 0 0 1 2.3 3.8v1.6" /></>
    };
    return <svg className={className} {...common}>{paths[name]}</svg>;
}

function Brand({ auth = false }) {
    return (
        <a className={`brand${auth ? " auth-brand" : ""}`} href="#dashboard" aria-label="Studyspace home">
            <img className="brand-logo" src={`${import.meta.env.BASE_URL}studyspace-logo.svg`} alt="" />
        </a>
    );
}

function AuthPage({ onAuthenticated }) {
    const [register, setRegister] = useState(false);
    const [role, setRole] = useState("student");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    function startDemo() {
        window.localStorage.setItem(DEMO_MODE_KEY, "true");
        window.localStorage.setItem(DEMO_ROLE_KEY, "student");
        window.localStorage.removeItem(AUTHENTICATED_KEY);
        onAuthenticated(getDemoUser());
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
            const result = await api(register ? "/api/auth/register" : "/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: String(form.get("email")).trim(),
                    password: String(form.get("password")),
                    ...(register ? {
                        role,
                        inviteCode: String(form.get("inviteCode") || "")
                    } : {})
                })
            });
            window.localStorage.removeItem(DEMO_MODE_KEY);
            window.localStorage.setItem(AUTHENTICATED_KEY, "true");
            onAuthenticated(result.user);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth-page auth-page-with-track">
            <header className="landing-header">
                <Brand />
                <nav aria-label="Home page navigation">
                    <a href="#how-it-works">How it works</a>
                    <button type="button" className="landing-signin" onClick={() => { setRegister(false); document.getElementById("authPanel")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Sign in</button>
                    <button type="button" className="landing-signup" onClick={() => { setRegister(true); document.getElementById("authPanel")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Get started <span aria-hidden="true">↗</span></button>
                </nav>
            </header>
            <section className="landing-hero" aria-labelledby="homeTitle">
                <div className="landing-copy">
                    <p className="section-kicker"><span className="landing-kicker-dot" /> A BETTER WAY TO STAY ON TRACK</p>
                    <h1 id="homeTitle">Make every assignment a step <span>forward.</span></h1>
                    <p className="landing-description">One clear place for students to manage work, teachers to give feedback, and everyone to see learning progress.</p>
                    <div className="landing-benefits">
                        <span><i aria-hidden="true">✓</i> Know what’s due</span>
                        <span><i aria-hidden="true">✓</i> Submit with confidence</span>
                        <span><i aria-hidden="true">✓</i> See progress clearly</span>
                    </div>
                    <a className="landing-learn-link" href="#how-it-works">Explore how it works <span aria-hidden="true">↓</span></a>
                    <div className="landing-art"><WelcomeArt /></div>
                </div>
                <section className="auth-card landing-auth-card" id="authPanel" aria-labelledby="authTitle">
                    <p className="section-kicker">{register ? "JOIN YOUR LEARNING SPACE" : "YOUR PERSONAL STUDY SPACE"}</p>
                    <h2 id="authTitle">{register ? "Create your account." : "Welcome back."}</h2>
                    <p className="auth-description">{register ? "Get started with your school workspace." : "Sign in to pick up where you left off."}</p>
                    <form onSubmit={handleSubmit}>
                        {register && <div className="field-group">
                            <label htmlFor="accountRole">Your role</label>
                            <select id="accountRole" value={role} onChange={(event) => setRole(event.target.value)}>
                                {roles.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
                            </select>
                        </div>}
                        <div className="field-group">
                            <label htmlFor="authEmail">Email address</label>
                            <input type="email" id="authEmail" name="email" placeholder="you@example.com" autoComplete="email" maxLength="254" required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="authPassword">Password</label>
                            <input type="password" id="authPassword" name="password" placeholder="At least 10 characters" autoComplete={register ? "new-password" : "current-password"} minLength="10" maxLength="128" required />
                        </div>
                        {register && role !== "student" && <div className="field-group">
                            <label htmlFor="inviteCode">Staff invitation code</label>
                            <input type="password" id="inviteCode" name="inviteCode" placeholder="Enter the code from your administrator" autoComplete="off" maxLength="128" required />
                        </div>}
                        {register && <p className="role-hint">Staff access requires an invitation. Students can create an account without a code.</p>}
                        {error && <p className="auth-error" role="alert">{error}</p>}
                        <button className="submit-button auth-submit" type="submit" disabled={busy}>
                            <span>{busy ? "One moment..." : register ? "Create account" : "Sign in"}</span><span aria-hidden="true">↗</span>
                        </button>
                    </form>
                    <div className="demo-divider"><span>OR</span></div>
                    <button className="demo-launch-button" type="button" onClick={startDemo}>Try the interactive demo <span aria-hidden="true">↗</span></button>
                    <p className="demo-hint">Explore student submissions and staff reviews. Sample changes stay in this browser.</p>
                    <p className="auth-switch">
                        {register ? "Already have an account? " : "New to Studyspace? "}
                        <button type="button" onClick={() => { setRegister(!register); setError(""); setRole("student"); }}>
                            {register ? "Sign in" : "Create an account"}
                        </button>
                    </p>
                    <p className="auth-footnote"><span aria-hidden="true">✦</span> Your assignments are private to your account.</p>
                </section>
            </section>
            <section className="public-workflow panel" id="how-it-works" aria-labelledby="publicWorkflowTitle">
                <div className="public-workflow-heading">
                    <div><p className="section-kicker">SIMPLE FROM START TO FINISH</p><h2 id="publicWorkflowTitle">Your learning, step by step.</h2></div>
                    <p>Students submit the work. Teachers and administrators review it. Progress stays clear for everyone.</p>
                </div>
                <ol className="public-workflow-track">
                    <li><span className="track-step-number">1</span><div><strong>Work assigned</strong><span>Teacher creates a task, or a student adds one.</span><em>Not submitted</em></div></li>
                    <li><span className="track-step-number">2</span><div><strong>Student completes and submits</strong><span>Finish the task and send it for teacher review.</span><em>Awaiting review</em></div></li>
                    <li><span className="track-step-number">3</span><div><strong>Teacher or admin reviews</strong><span>Staff checks the work and approves it or gives feedback.</span><em>Approve or request changes</em></div></li>
                    <li><span className="track-step-number">4</span><div><strong>Track the outcome</strong><span>Approved work is done. Requested changes can be resubmitted.</span><em>Approved or changes requested</em></div></li>
                </ol>
                <div className="public-workflow-roles">
                    <div><span className="track-role-icon">S</span><p><strong>Student</strong><span>Completes and submits work; cannot approve it.</span></p></div>
                    <div><span className="track-role-icon staff-role">T</span><p><strong>Teacher / administrator</strong><span>Reviews submissions and records the decision.</span></p></div>
                </div>
            </section>
            <footer className="landing-footer"><Brand /><span>One step at a time. Every bit of progress counts.</span><a href="#homeTitle">Back to top ↑</a></footer>
        </main>
    );
}

function WelcomeArt() {
    return (
        <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
            <div className="art-card">
                <div className="art-card-top"><span className="art-mini-icon">✓</span><span className="art-lines"><i /><i /></span></div>
                <div className="art-check-row"><span className="fake-check checked">✓</span><i /><span className="fake-tag" /></div>
                <div className="art-check-row"><span className="fake-check" /><i /><span className="fake-tag tag-yellow" /></div>
                <div className="art-check-row"><span className="fake-check" /><i /><span className="fake-tag tag-blue" /></div>
                <div className="art-progress"><span /></div>
            </div>
            <span className="art-bubble bubble-top">You’ve got this!</span>
            <span className="art-bubble bubble-bottom">✦ &nbsp; One step at a time</span>
        </div>
    );
}

function EmptyState({ title, copy, children }) {
    return <div className="empty-state"><span className="empty-illustration" aria-hidden="true">✳</span><h3>{title}</h3><p>{copy}</p>{children}</div>;
}

function todayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDueDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })
        .format(new Date(year, month - 1, day));
}

function statusLabel(status) {
    return ({
        pending: "Not submitted",
        submitted: "Awaiting review",
        approved: "Approved",
        revision_requested: "Changes requested"
    })[status] || "Not submitted";
}

function AssignmentCard({ assignment, role, onSubmit, onReview, onDelete }) {
    const [submissionNote, setSubmissionNote] = useState(assignment.submissionNote || "");
    const [feedback, setFeedback] = useState(assignment.feedback || "");
    const [busy, setBusy] = useState(false);
    const overdue = assignment.status === "pending" && assignment.dueDate < todayKey();

    async function handleSubmission(event) {
        event.preventDefault();
        setBusy(true);
        try { await onSubmit(assignment, submissionNote); }
        finally { setBusy(false); }
    }

    async function review(decision) {
        setBusy(true);
        try { await onReview(assignment, decision, feedback); }
        finally { setBusy(false); }
    }

    return (
        <article className={`assignment-card workflow-card${assignment.status === "approved" ? " is-approved" : ""}`}>
            <div className="assignment-main">
                <h3 className="assignment-title">{assignment.title}</h3>
                <div className="assignment-meta">
                    <span className="subject-tag">{assignment.subject}</span><span className="meta-separator" aria-hidden="true">·</span>
                    <span>Due {formatDueDate(assignment.dueDate)}</span>
                    {role !== "student" && assignment.studentEmail && <><span className="meta-separator" aria-hidden="true">·</span><span>{assignment.studentEmail}</span></>}
                </div>
            </div>
            <span className={`assignment-status ${assignment.status === "approved" ? "status-completed" : assignment.status === "revision_requested" || overdue ? "status-overdue" : assignment.status === "submitted" ? "status-submitted" : ""}`}>
                {overdue ? "Past due" : statusLabel(assignment.status)}
            </span>
            {assignment.submissionNote && <p className="workflow-note"><strong>Student note:</strong> {assignment.submissionNote}</p>}
            {assignment.feedback && <p className="workflow-feedback"><strong>Reviewer feedback:</strong> {assignment.feedback}</p>}

            {role === "student" && (assignment.status === "pending" || assignment.status === "revision_requested") && (
                <form className="workflow-form" onSubmit={handleSubmission}>
                    <label htmlFor={`submission-${assignment._id}`}>{assignment.status === "revision_requested" ? "Update your work or add a note" : "Optional note for your teacher"}</label>
                    <textarea id={`submission-${assignment._id}`} value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} maxLength="2000" placeholder="Tell your teacher what you completed..." rows="2" />
                    <button className="workflow-button student-submit" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit for teacher review"}</button>
                </form>
            )}

            {(role === "teacher" || role === "admin") && assignment.status === "submitted" && (
                <div className="review-controls">
                    <label htmlFor={`feedback-${assignment._id}`}>Feedback for student</label>
                    <textarea id={`feedback-${assignment._id}`} value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength="2000" placeholder="Add feedback (required when requesting changes)..." rows="2" />
                    <div className="review-actions">
                        <button className="workflow-button approve-button" type="button" disabled={busy} onClick={() => review("approved")}>{busy ? "Saving..." : "Approve work"}</button>
                        <button className="workflow-button revision-button" type="button" disabled={busy || !feedback.trim()} onClick={() => review("revision_requested")}>Request changes</button>
                    </div>
                </div>
            )}

            {role === "admin" && <div className="assignment-actions admin-actions">
                <button className="delete-button" type="button" onClick={() => onDelete(assignment)}>Delete assignment</button>
            </div>}
        </article>
    );
}

function LearningHub() {
    const [query, setQuery] = useState("");
    const [subject, setSubject] = useState("All topics");
    const materials = learningMaterials.filter((material) =>
        (subject === "All topics" || material.subject === subject) &&
        `${material.title} ${material.detail} ${material.subject}`.toLowerCase().includes(query.toLowerCase())
    );
    const options = ["All topics", ...new Set(learningMaterials.map((material) => material.subject))];
    return (
        <section className="learning-page">
            <div className="page-intro panel"><p className="section-kicker">LEARN AT YOUR PACE</p><h1>Your learning hub</h1><p>Practical study notes and small strategies to help you make steady progress.</p></div>
            <div className="learning-tools">
                <label className="search-box"><Icon name="search" /><input aria-label="Search learning materials" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learning materials..." /></label>
                <label className="filter-select"><span className="visually-hidden">Filter learning topics</span><select value={subject} onChange={(event) => setSubject(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
            </div>
            <div className="learning-grid">
                {materials.length ? materials.map((material) => <article className="learning-card panel" key={material.title}>
                    <span className="learning-icon" aria-hidden="true">{material.icon}</span><p className="section-kicker">{material.subject}</p><h2>{material.title}</h2><p>{material.detail}</p>
                </article>) : <EmptyState title="No learning notes found." copy="Try a different keyword or topic." />}
            </div>
        </section>
    );
}

function AssignmentForm({ role, students, onCreate }) {
    const [busy, setBusy] = useState(false);
    async function submit(event) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const values = new FormData(formElement);
        setBusy(true);
        try {
            await onCreate({
                title: String(values.get("title")).trim(),
                subject: String(values.get("subject")),
                dueDate: String(values.get("dueDate")),
                ...(role !== "student" ? { studentId: String(values.get("studentId")) } : {})
            });
            formElement.reset();
            document.getElementById("title")?.focus();
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className="panel form-panel" id="new-assignment" aria-labelledby="formTitle">
            <div className="panel-heading"><div><p className="section-kicker">{role === "student" ? "MAKE A PLAN" : "CLASSROOM TOOLS"}</p><h2 id="formTitle">{role === "student" ? "New assignment" : "Assign student work"}</h2></div><span className="heading-icon" aria-hidden="true">＋</span></div>
            <p className="form-intro">{role === "student" ? "Add your task. You can submit it for teacher approval when finished." : "Create a task in a student's workspace."}</p>
            {role !== "student" && students.length === 0
                ? <EmptyState title="No student accounts yet." copy="Students appear here after they create their accounts." />
                : <form id="assignmentForm" onSubmit={submit}>
                    {role !== "student" && <div className="field-group"><label htmlFor="studentId">Assign to student</label><select id="studentId" name="studentId" defaultValue="" required><option value="" disabled>Choose a student</option>{students.map((student) => <option value={student.id} key={student.id}>{student.email}</option>)}</select></div>}
                    <div className="field-group"><label htmlFor="title">Assignment name</label><input type="text" id="title" name="title" placeholder="e.g. Chapter 4 problem set" maxLength="100" required /></div>
                    <div className="field-group"><label htmlFor="subject">Subject</label><select id="subject" name="subject" defaultValue="" required><option value="" disabled>Choose a subject</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></div>
                    <div className="field-group"><label htmlFor="dueDate">Due date</label><input type="date" id="dueDate" name="dueDate" min={todayKey()} required /></div>
                    <button className="submit-button" type="submit" disabled={busy}><span>{busy ? "Adding assignment..." : role === "student" ? "Add to my assignments" : "Assign to student"}</span><span aria-hidden="true">↗</span></button>
                </form>}
            <p className="form-hint"><span aria-hidden="true">✦</span> Students submit work. Teachers and admins review it.</p>
        </section>
    );
}

function AssignmentList({ assignments, loading, role, onSubmit, onReview, onDelete }) {
    if (loading) return <EmptyState title="Getting assignments..." copy="Just a moment while we open your workspace." />;
    if (assignments.length === 0) return <EmptyState title="Nothing here yet." copy={role === "student" ? "Your assignments will appear here when you add or receive them." : "New student work will appear here when it is submitted."} />;

    const groups = new Map();
    for (const assignment of assignments) {
        const subject = assignment.subject || "Other";
        if (!groups.has(subject)) groups.set(subject, []);
        groups.get(subject).push(assignment);
    }
    const orderedSubjects = [
        ...subjects.filter((subject) => groups.has(subject)),
        ...[...groups.keys()].filter((subject) => !subjects.includes(subject)).sort()
    ];

    return <div className="subject-assignment-groups">
        {orderedSubjects.map((subject) => <section className="subject-assignment-group" key={subject} aria-labelledby={`subject-${subject.replace(/[^a-z0-9]+/gi, "-")}`}>
            <div className="subject-group-heading">
                <h3 id={`subject-${subject.replace(/[^a-z0-9]+/gi, "-")}`}>{subject}</h3>
                <span>{groups.get(subject).length} {groups.get(subject).length === 1 ? "assignment" : "assignments"}</span>
            </div>
            <div className="assignment-list">{groups.get(subject).map((assignment) =>
                <AssignmentCard key={assignment._id} assignment={assignment} role={role} onSubmit={onSubmit} onReview={onReview} onDelete={onDelete} />
            )}</div>
        </section>)}
    </div>;
}

function RoleTable({ users, onChangeRole }) {
    return <div className="users-table-wrap"><table className="users-table">
        <thead><tr><th>Account</th><th>Current role</th><th>Change access</th></tr></thead>
        <tbody>{users.map((account) => <tr key={account.id}>
            <td>{account.email}</td>
            <td><span className={`role-chip role-${account.role}`}>{roles.find((item) => item.value === account.role)?.label || account.role}</span></td>
            <td><select aria-label={`Change role for ${account.email}`} value={account.role} onChange={(event) => onChangeRole(account, event.target.value)}>{roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td>
        </tr>)}</tbody>
    </table></div>;
}

function StudentProgress({ students: studentProgress, loading }) {
    const [query, setQuery] = useState("");
    const filteredStudents = studentProgress.filter((student) =>
        student.email.toLowerCase().includes(query.trim().toLowerCase())
    );

    if (loading) return <EmptyState title="Loading student progress..." copy="Checking assignment activity by subject." />;

    return <section className="panel list-panel full-panel student-progress-panel">
        <div className="list-heading"><div><p className="section-kicker">TEACHER & ADMIN ONLY</p><h2>Progress by student and subject <span className="heading-count">{studentProgress.length}</span></h2></div></div>
        <p className="form-intro">Every subject is listed for each student. “Not assigned” means no task exists yet; “Not done” highlights work still to complete.</p>
        <div className="list-tools">
            <label className="search-box"><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a student..." aria-label="Search student progress" /></label>
        </div>
        {studentProgress.length === 0
            ? <EmptyState title="No student accounts yet." copy="Student progress will appear here after students join." />
            : filteredStudents.length === 0
                ? <EmptyState title="No matching students." copy="Try another email address." />
                : <div className="progress-matrix-wrap"><table className="progress-matrix">
                    <thead><tr><th scope="col">Student</th>{subjects.map((subject) => <th scope="col" key={subject}>{subject}</th>)}</tr></thead>
                    <tbody>{filteredStudents.map((student) => <tr key={student.studentId}>
                        <th scope="row">{student.email}</th>
                        {student.subjects.map((item) => {
                            const statusLabels = {
                                done: "Done",
                                not_done: "Not done",
                                awaiting_review: "Awaiting review",
                                changes_requested: "Changes requested",
                                not_assigned: "Not assigned"
                            };
                            const detail = item.total
                                ? `${item.approved} approved · ${item.submitted} awaiting review · ${item.pending} not submitted · ${item.revision_requested} changes requested`
                                : "No assignments in this subject";
                            return <td key={item.subject}>
                                <span className={`progress-status progress-status-${item.status}`}>{statusLabels[item.status]}</span>
                                {item.total > 0 && <span className="progress-cell-count" title={detail}>{item.approved}/{item.total} approved</span>}
                            </td>;
                        })}
                    </tr>)}</tbody>
                </table></div>}
        <div className="progress-legend" aria-label="Progress status legend">
            {[
                ["done", "Done"],
                ["not_done", "Not done"],
                ["awaiting_review", "Awaiting review"],
                ["changes_requested", "Changes requested"],
                ["not_assigned", "Not assigned"]
            ].map(([status, label]) => <span key={status}><i className={`progress-status progress-status-${status}`} />{label}</span>)}
        </div>
    </section>;
}

function Dashboard({ user, onSignOut, onSessionExpired, onDemoRoleChange, onResetDemo }) {
    const role = user.role || "student";
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState([]);
    const [users, setUsers] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [directorReport, setDirectorReport] = useState(null);
    const [page, setPage] = useState("overview");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [submissionAlerts, setSubmissionAlerts] = useState([]);
    const seenSubmissionKeys = useRef(null);

    const staff = role === "teacher" || role === "admin";
    const admin = role === "admin";

    function handleRequestError(requestError) {
        if (requestError.status === 401) onSessionExpired();
        else setError(requestError.message);
    }

    async function loadAssignments() {
        const result = await api("/api/assignments");
        setAssignments(result.assignments);
        if (staff) {
            const progress = await api("/api/students/progress");
            setStudentProgress(progress.students);
        }
    }

    async function loadRoleData() {
        const requests = [];
        if (staff) requests.push(api("/api/students").then((result) => setStudents(result.students)));
        if (staff) requests.push(api("/api/students/progress").then((result) => setStudentProgress(result.students)));
        if (admin) requests.push(api("/api/users").then((result) => setUsers(result.users)));
        if (role === "director" || admin) {
            requests.push(api("/api/director/overview").then((result) => setDirectorReport(result)));
        }
        await Promise.all(requests);
    }

    useEffect(() => {
        let active = true;
        const requests = [];
        if (role !== "director") {
            requests.push(api("/api/assignments").then((result) => {
                if (active) {
                    setAssignments(result.assignments);
                    if (staff) {
                        seenSubmissionKeys.current = new Set(
                            result.assignments
                                .filter((item) => item.status === "submitted")
                                .map(submissionKey)
                        );
                    }
                }
            }));
        }
        if (staff) requests.push(api("/api/students").then((result) => { if (active) setStudents(result.students); }));
        if (staff) requests.push(api("/api/students/progress").then((result) => { if (active) setStudentProgress(result.students); }));
        if (admin) requests.push(api("/api/users").then((result) => { if (active) setUsers(result.users); }));
        if (role === "director" || admin) {
            requests.push(api("/api/director/overview").then((result) => { if (active) setDirectorReport(result); }));
        }
        Promise.all(requests)
            .catch((requestError) => { if (active) handleRequestError(requestError); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [role]);

    useEffect(() => {
        if (!staff) return undefined;
        let active = true;
        let refreshing = false;
        const interval = window.setInterval(async () => {
            if (refreshing) return;
            refreshing = true;
            try {
                const result = await api("/api/assignments");
                if (!active) return;
                const submitted = result.assignments.filter((item) => item.status === "submitted");
                if (seenSubmissionKeys.current === null) {
                    seenSubmissionKeys.current = new Set(submitted.map(submissionKey));
                } else {
                    const fresh = submitted.filter((item) => !seenSubmissionKeys.current.has(submissionKey(item)));
                    for (const item of submitted) seenSubmissionKeys.current.add(submissionKey(item));
                    if (fresh.length) {
                        setSubmissionAlerts((current) => [
                            ...fresh.map((item) => ({
                                id: `${item._id}-${item.submittedAt || ""}`,
                                title: item.title,
                                subject: item.subject,
                                studentEmail: item.studentEmail
                            })),
                            ...current
                        ].slice(0, 5));
                    }
                }
                setAssignments(result.assignments);
            } catch (requestError) {
                if (active) {
                    if (requestError.status === 401) onSessionExpired();
                    else setError(requestError.message);
                }
            } finally {
                refreshing = false;
            }
        }, 15000);
        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [staff, onSessionExpired]);

    const stats = useMemo(() => {
        const approved = assignments.filter((item) => item.status === "approved").length;
        return {
            total: assignments.length,
            pending: assignments.filter((item) => item.status === "pending").length,
            submitted: assignments.filter((item) => item.status === "submitted").length,
            approved,
            revisions: assignments.filter((item) => item.status === "revision_requested").length,
            overdue: assignments.filter((item) => item.status === "pending" && item.dueDate < todayKey()).length,
            progress: assignments.length ? Math.round((approved / assignments.length) * 100) : 0
        };
    }, [assignments]);

    const filteredAssignments = useMemo(() => assignments.filter((item) => {
        const matchesSearch = `${item.title} ${item.subject} ${item.studentEmail}`.toLowerCase().includes(query.trim().toLowerCase());
        const matchesFilter = filter === "all" ||
            (filter === "pending" && item.status === "pending") ||
            (filter === "submitted" && item.status === "submitted") ||
            (filter === "approved" && item.status === "approved") ||
            (filter === "revision_requested" && item.status === "revision_requested");
        return matchesSearch && matchesFilter;
    }), [assignments, filter, query]);

    const reviewQueue = useMemo(() => assignments.filter((item) => item.status === "submitted"), [assignments]);

    const navItems = {
        student: [
            { id: "overview", label: "My dashboard", icon: "grid" },
            { id: "assignments", label: "My assignments", icon: "tasks", count: stats.total },
            { id: "learning", label: "Learning hub", icon: "book" }
        ],
        teacher: [
            { id: "overview", label: "Teacher home", icon: "grid" },
            { id: "review", label: "Review queue", icon: "check", count: stats.submitted },
            { id: "student-progress", label: "Student progress", icon: "chart" },
            { id: "assignments", label: "Class assignments", icon: "tasks" },
            { id: "learning", label: "Learning hub", icon: "book" }
        ],
        director: [
            { id: "overview", label: "Director overview", icon: "grid" },
            { id: "reports", label: "Learning reports", icon: "chart" },
            { id: "learning", label: "Learning hub", icon: "book" }
        ],
        admin: [
            { id: "overview", label: "Admin overview", icon: "grid" },
            { id: "review", label: "Review queue", icon: "check", count: stats.submitted },
            { id: "student-progress", label: "Student progress", icon: "chart" },
            { id: "assignments", label: "All assignments", icon: "tasks", count: stats.total },
            { id: "people", label: "People & access", icon: "people" },
            { id: "reports", label: "Learning reports", icon: "chart" },
            { id: "learning", label: "Learning hub", icon: "book" }
        ]
    };
    const currentNavItems = navItems[role] || navItems.student;
    const pageTitles = Object.fromEntries(currentNavItems.map((item) => [item.id, item.label]));

    async function handleCreate(payload) {
        setError("");
        try {
            await api("/api/assignments", { method: "POST", body: JSON.stringify(payload) });
            await loadAssignments();
        } catch (requestError) { handleRequestError(requestError); }
    }

    async function handleSubmit(assignment, submissionNote) {
        setError("");
        try {
            await api(`/api/assignments/${assignment._id}`, {
                method: "PATCH",
                body: JSON.stringify({ submissionNote })
            });
            await loadAssignments();
        } catch (requestError) { handleRequestError(requestError); }
    }

    async function handleReview(assignment, decision, feedback) {
        if (decision === "revision_requested" && !feedback.trim()) {
            setError("Add feedback before requesting changes.");
            return;
        }
        setError("");
        try {
            await api(`/api/assignments/${assignment._id}/review`, {
                method: "POST",
                body: JSON.stringify({ decision, feedback })
            });
            await loadAssignments();
        } catch (requestError) { handleRequestError(requestError); }
    }

    async function handleDelete(assignment) {
        if (!window.confirm(`Delete "${assignment.title}"? This cannot be undone.`)) return;
        setError("");
        try {
            await api(`/api/assignments/${assignment._id}`, { method: "DELETE" });
            await loadAssignments();
        } catch (requestError) { handleRequestError(requestError); }
    }

    async function handleChangeRole(account, nextRole) {
        if (nextRole === account.role) return;
        setError("");
        try {
            await api(`/api/users/${account.id}/role`, {
                method: "PATCH",
                body: JSON.stringify({ role: nextRole })
            });
            await loadRoleData();
        } catch (requestError) { handleRequestError(requestError); }
    }

    async function handleSignOut() {
        try { await onSignOut(); }
        catch (requestError) { setError(requestError.message); }
    }

    const heading = role === "student" ? "Your study space"
        : role === "teacher" ? "Teacher workspace"
            : role === "director" ? "Learning overview" : "Platform administration";

    function renderOverview() {
        if (role === "director") {
            const report = directorReport || { students: 0, assignments: { total: 0, pending: 0, submitted: 0, approved: 0, revisionRequested: 0 }, bySubject: [] };
            return <>
                <section className="welcome role-welcome"><div className="welcome-copy"><p className="eyebrow"><span className="welcome-dot" /> DIRECTOR PORTAL · READ ONLY</p><h1>Learning in <span>view.</span></h1><p className="welcome-description">Monitor school-wide learning progress and review subject activity. Student work is not editable here.</p></div><WelcomeArt /></section>
                <section className="stats" aria-label="School learning overview">
                    <StatCard label="Students" value={report.students} icon="people" tone="blue" />
                    <StatCard label="Assignments" value={report.assignments.total} icon="tasks" tone="blue" />
                    <StatCard label="Awaiting review" value={report.assignments.submitted} icon="clock" tone="gold" />
                    <StatCard label="Approved" value={report.assignments.approved} icon="check" tone="green" />
                </section>
                <ReportSubjects subjects={report.bySubject} />
                <section className="panel director-note"><span className="note-sparkle">✳</span><div><h2>Read-only director access</h2><p>Only teachers and administrators can review submissions. Directors can monitor reports and explore learning materials.</p></div></section>
            </>;
        }

        const isStudent = role === "student";
        return <>
            <section className="welcome"><div className="welcome-copy"><p className="eyebrow"><span className="welcome-dot" /> {isStudent ? "YOUR PERSONAL STUDY SPACE" : role === "teacher" ? "TEACHER & TRAINER PORTAL" : "ADMINISTRATOR PORTAL"}</p><h1>{isStudent ? <>A little progress<br />goes a <span>long way.</span></> : <>{role === "teacher" ? "Guide learning." : "Your platform,"}<br /><span>{role === "teacher" ? "one review at a time." : "in your hands."}</span></>}</h1><p className="welcome-description">{isStudent ? "Complete your work and send it to a teacher for approval." : role === "teacher" ? "Review student submissions, give feedback, and approve completed work." : "Manage access, review student work, and oversee the learning platform."}</p></div><WelcomeArt /></section>
            <section className="stats" aria-label="Assignment overview">
                <StatCard label={isStudent ? "My assignments" : "All assignments"} value={stats.total} icon="tasks" tone="blue" />
                <StatCard label={isStudent ? "Not submitted" : "Awaiting review"} value={isStudent ? stats.pending : stats.submitted} icon="clock" tone="gold" />
                <StatCard label="Approved" value={stats.approved} icon="check" tone="green" />
                <StatCard label={isStudent ? "Changes requested" : "Past due"} value={isStudent ? stats.revisions : stats.overdue} icon="alert" tone="pink" />
            </section>
            <section className="panel workflow-guide" aria-labelledby="workflowGuideTitle">
                <div className="workflow-guide-heading">
                    <div><p className="section-kicker">{isStudent ? "STUDENT GUIDE" : "TEACHER & ADMIN GUIDE"}</p><h2 id="workflowGuideTitle">{isStudent ? "How to submit your assignment" : "How to review student work"}</h2></div>
                    <button className="workflow-button approve-button" type="button" onClick={() => setPage(isStudent ? "assignments" : "review")}>
                        {isStudent ? "Go to my assignments ↗" : "Open review queue ↗"}
                    </button>
                </div>
                <ol className="workflow-guide-steps">
                    {isStudent ? <>
                        <li><strong>Open My assignments.</strong><span>Find the task and check its subject and due date.</span></li>
                        <li><strong>Complete the work.</strong><span>Use the assignment instructions from your teacher.</span></li>
                        <li><strong>Submit for teacher review.</strong><span>On the assignment card, add an optional note and select “Submit for teacher review.” The status changes to “Awaiting review.”</span></li>
                        <li><strong>Check the result.</strong><span>Your teacher or administrator will approve it or request changes. If changes are requested, update your work and submit it again.</span></li>
                    </> : <>
                        <li><strong>Open the Review queue.</strong><span>It contains student work waiting for your decision.</span></li>
                        <li><strong>Check the assignment and student note.</strong><span>Use the student name, subject, and submission note to review the work.</span></li>
                        <li><strong>Choose an action.</strong><span>Select “Approve work” when it is complete, or add feedback and select “Request changes.” Feedback is required when requesting changes.</span></li>
                        <li><strong>Student progress updates.</strong><span>Approved work counts as done. Requested changes return to the student for another submission.</span></li>
                    </>}
                </ol>
            </section>
            <section className="progress-section panel" id="progress">
                <div className="progress-heading"><div><p className="section-kicker">{isStudent ? "YOUR MOMENTUM" : "STUDENT WORKFLOW"}</p><h2>{isStudent ? "Approved progress" : "Submission progress"}</h2></div><span className="progress-badge"><span className="progress-badge-dot" />{stats.progress}% approved</span></div>
                <div className="progress-track" role="progressbar" aria-label="Approved assignments" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stats.progress}><div className="progress-bar" style={{ width: `${stats.progress}%` }} /></div>
                <p className="progress-caption">{isStudent ? "A teacher or administrator must approve submitted work before it counts as complete." : `${stats.submitted} student submissions need review.`}</p>
            </section>
            {staff && <section className="panel quick-queue"><div><p className="section-kicker">TEACHER ACTIONS</p><h2>{stats.submitted ? `${stats.submitted} submission${stats.submitted === 1 ? "" : "s"} waiting for review` : "Your review queue is clear"}</h2></div><button className="workflow-button approve-button" type="button" onClick={() => setPage("review")}>Open review queue ↗</button></section>}
        </>;
    }

    function renderAssignmentsPage(reviewOnly = false) {
        const selected = reviewOnly ? reviewQueue : filteredAssignments;
        return <section className="panel list-panel full-panel">
            <div className="list-heading"><div><p className="section-kicker">{reviewOnly ? "TEACHER & ADMIN ONLY" : role === "student" ? "YOUR WORKFLOW" : "PLATFORM WORK"}</p><h2>{reviewOnly ? "Review submissions" : role === "student" ? "My assignments" : "Assignments"} <span className="heading-count">{selected.length}</span></h2></div></div>
            {!reviewOnly && <div className="list-tools">
                <label className="search-box"><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assignments..." aria-label="Search assignments" /></label>
                <label className="filter-select"><span className="visually-hidden">Filter assignments</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Not submitted</option><option value="submitted">Awaiting review</option><option value="approved">Approved</option><option value="revision_requested">Changes requested</option></select></label>
            </div>}
            <AssignmentList assignments={selected} loading={loading} role={role} onSubmit={handleSubmit} onReview={handleReview} onDelete={handleDelete} />
        </section>;
    }

    function renderReports() {
        const report = directorReport || { students: 0, assignments: { total: 0, pending: 0, submitted: 0, approved: 0, revisionRequested: 0 }, bySubject: [] };
        return <section className="reports-page">
            <div className="page-intro panel"><p className="section-kicker">DIRECTOR & ADMIN VIEW</p><h1>Learning reports</h1><p>School-wide totals only. Individual work approvals remain with teachers and administrators.</p></div>
            <section className="stats report-stats" aria-label="School-wide report">
                <StatCard label="Students" value={report.students} icon="people" tone="blue" />
                <StatCard label="Not submitted" value={report.assignments.pending} icon="clock" tone="gold" />
                <StatCard label="Awaiting review" value={report.assignments.submitted} icon="tasks" tone="blue" />
                <StatCard label="Changes requested" value={report.assignments.revisionRequested} icon="alert" tone="pink" />
            </section>
            <ReportSubjects subjects={report.bySubject} />
        </section>;
    }

    return (
        <div className="app-shell" id="dashboard">
            <aside className="sidebar" aria-label="Main navigation">
                <Brand />
                <div className="portal-identity"><span className={`portal-avatar avatar-${role}`}>{role === "admin" ? "A" : role === "director" ? "D" : role === "teacher" ? "T" : "S"}</span><div><strong>{roleName(role)}</strong><span>{user.email}</span></div></div>
                <p className="sidebar-label">YOUR PORTAL</p>
                <nav className="side-nav" aria-label={`${roleName(role)} pages`}>
                    {currentNavItems.filter((item) => item.id !== "learning").map((item) =>
                        <button className={`nav-link${page === item.id ? " active" : ""}`} key={item.id} type="button" onClick={() => setPage(item.id)} aria-current={page === item.id ? "page" : undefined}>
                            <Icon name={item.icon} />{item.label}{item.count !== undefined && <span className="nav-count">{item.count}</span>}
                        </button>
                    )}
                </nav>
                <p className="sidebar-label learning-nav-label">LEARNING</p>
                <nav className="side-nav" aria-label="Learning pages">
                    {currentNavItems.filter((item) => item.id === "learning").map((item) =>
                        <button className={`nav-link${page === item.id ? " active" : ""}`} key={item.id} type="button" onClick={() => setPage(item.id)} aria-current={page === item.id ? "page" : undefined}><Icon name={item.icon} />{item.label}</button>
                    )}
                </nav>
                <div className="sidebar-note"><span className="note-sparkle" aria-hidden="true">✳</span><p className="note-title">One thing at a time.</p><p className="note-copy">Small steps today make big progress tomorrow.</p></div>
                <div className="sidebar-footer"><span className="online-dot" />Role-based learning workspace</div>
            </aside>

            <main className="main-content">
                {user.demo && <div className="demo-mode-banner">
                    <span><strong>Showcase demo</strong> · sample data saved in this browser only</span>
                    <label>View as
                        <select value={role} onChange={(event) => onDemoRoleChange(event.target.value)} aria-label="Switch demo role">
                            {roles.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
                        </select>
                    </label>
                    <button type="button" onClick={onResetDemo}>Reset demo data</button>
                </div>}
                <header className="topbar">
                    <div className="breadcrumb"><span>{roleName(role)} portal</span><span className="breadcrumb-divider">/</span><strong>{pageTitles[page] || "Dashboard"}</strong></div>
                    <div className="topbar-account">
                        {staff && <button className="submission-alert-trigger" type="button" onClick={() => setPage("review")} aria-label={`${stats.submitted} submissions awaiting review; open review queue`}>
                            <Icon name="alert" /><span>Review alerts</span>{stats.submitted > 0 && <span className="nav-count">{stats.submitted}</span>}
                        </button>}
                        <div className="topbar-date"><span className="date-icon"><Icon name="calendar" /></span>{new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</div><button className="logout-button" type="button" onClick={handleSignOut}>Sign out</button>
                    </div>
                </header>
                {error && <p className="app-error" role="alert">{error}</p>}
                {staff && submissionAlerts.length > 0 && <aside className="submission-alerts" aria-label="New assignment submissions">
                    {submissionAlerts.map((alert) => <div className="submission-alert" role="status" key={alert.id}>
                        <span className="submission-alert-icon" aria-hidden="true">!</span>
                        <p><strong>New assignment submitted</strong><span>{alert.studentEmail} · {alert.subject} · {alert.title}</span></p>
                        <button type="button" onClick={() => { setPage("review"); setSubmissionAlerts((current) => current.filter((item) => item.id !== alert.id)); }}>Review</button>
                        <button className="dismiss-alert" type="button" aria-label="Dismiss submission alert" onClick={() => setSubmissionAlerts((current) => current.filter((item) => item.id !== alert.id))}>×</button>
                    </div>)}
                </aside>}

                <div className="page-content">
                    {page === "overview" && renderOverview()}
                    {page === "learning" && <LearningHub />}
                    {page === "assignments" && <div className="workspace-grid role-workspace"><AssignmentForm role={role} students={students} onCreate={handleCreate} />{renderAssignmentsPage()}</div>}
                    {page === "review" && renderAssignmentsPage(true)}
                    {page === "student-progress" && staff && <StudentProgress students={studentProgress} loading={loading} />}
                    {page === "reports" && renderReports()}
                    {page === "people" && <section className="panel list-panel full-panel people-panel"><div className="list-heading"><div><p className="section-kicker">ADMINISTRATOR ONLY</p><h2>People & access <span className="heading-count">{users.length}</span></h2></div></div><p className="form-intro">Change account roles here. Only an administrator can grant staff or director access.</p>{loading ? <EmptyState title="Loading accounts..." copy="Just a moment." /> : <RoleTable users={users} onChangeRole={handleChangeRole} />}</section>}
                    <footer className="page-footer"><span>Studyspace <span className="footer-heart">✦</span> learning together</span><span>Role-based access keeps every workspace in its place.</span></footer>
                </div>
            </main>
        </div>
    );
}

function submissionKey(assignment) {
    return `${assignment._id}-${assignment.submittedAt || ""}`;
}

function roleName(role) {
    return ({ student: "Student", teacher: "Teacher", director: "Director", admin: "Administrator" })[role] || "Student";
}

function StatCard({ label, value, icon, tone }) {
    return <article className="stat-card"><div className="stat-top"><span className="stat-label">{label}</span><span className={`stat-icon icon-${tone}`}><Icon name={icon} /></span></div><div className="stat-bottom"><strong>{value}</strong><span className="stat-footnote">{label === "Awaiting review" ? "teacher action" : label === "Students" ? "registered accounts" : "in this workspace"}</span></div></article>;
}

function ReportSubjects({ subjects: subjectCounts }) {
    const largestCount = Math.max(1, ...subjectCounts.map((item) => item.count));
    return <section className="panel subject-report"><div><p className="section-kicker">SCHOOL-WIDE ACTIVITY</p><h2>Assignments by subject</h2></div>
        {subjectCounts.length === 0 ? <EmptyState title="No subject activity yet." copy="Assignment activity will appear here." /> :
            <div className="subject-bars">{subjectCounts.map((item) => <div className="subject-bar-row" key={item.subject}><span>{item.subject || "Uncategorized"}</span><div className="progress-track"><div className="progress-bar" style={{ width: `${Math.max(5, Math.round((item.count / largestCount) * 100))}%` }} /></div><strong>{item.count}</strong></div>)}</div>}
    </section>;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let active = true;
        if (isDemoMode()) {
            setUser(getDemoUser());
            setCheckingSession(false);
        } else if (window.localStorage.getItem(AUTHENTICATED_KEY) === "true") {
            api("/api/auth/me")
                .then((result) => { if (active) setUser(result.user); })
                .catch(() => {
                    if (active) {
                        window.localStorage.removeItem(AUTHENTICATED_KEY);
                        setUser(null);
                    }
                })
                .finally(() => { if (active) setCheckingSession(false); });
        } else {
            setCheckingSession(false);
        }
        return () => { active = false; };
    }, []);

    async function signOut() {
        await api("/api/auth/logout", { method: "POST" });
        window.localStorage.removeItem(AUTHENTICATED_KEY);
        setUser(null);
    }

    function changeDemoRole(role) {
        if (!roles.some((item) => item.value === role)) return;
        window.localStorage.setItem(DEMO_ROLE_KEY, role);
        setUser(getDemoUser());
    }

    function resetDemo() {
        if (!window.confirm("Reset all showcase changes and restore the sample assignments?")) return;
        window.localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(seedDemoData()));
        window.location.reload();
    }

    if (checkingSession) return <main className="auth-page"><div className="loading-card"><Brand auth /><p>Opening your study space...</p></div></main>;
    return user
        ? <Dashboard user={user} onSignOut={signOut} onSessionExpired={() => { window.localStorage.removeItem(AUTHENTICATED_KEY); setUser(null); }} onDemoRoleChange={changeDemoRole} onResetDemo={resetDemo} />
        : <AuthPage onAuthenticated={setUser} />;
}
