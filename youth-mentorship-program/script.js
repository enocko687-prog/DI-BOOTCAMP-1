function showLogin() {
    if (isAuthenticated) {
        return;
    }
    const modal = document.getElementById("loginModal");
    modal.style.display = "flex";
    document.getElementById("loginUsername").focus();
}

function closeLogin() {
    if (!isAuthenticated) {
        return;
    }
    const modal = document.getElementById("loginModal");
    modal.style.display = "none";
}

let csrfToken = "";
let isAuthenticated = false;
let dashboardDataReady;
let resolveDashboardDataReady;

async function apiRequest(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const response = await fetch(path, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)
                ? { "X-CSRF-Token": csrfToken }
                : {}),
            ...options.headers
        }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.error || `Request failed with status ${response.status}.`);
    }
    return payload;
}

function setLoginMode(setupRequired) {
    const title = document.getElementById("loginTitle");
    const description = document.getElementById("loginDescription");
    const confirmField = document.getElementById("confirmPasswordField");
    const confirmInput = document.getElementById("confirmPassword");
    const password = document.getElementById("loginPassword");
    const submit = document.getElementById("loginSubmit");
    title.textContent = setupRequired ? "Create your local account" : "Sign in";
    description.textContent = setupRequired
        ? "First-time setup: create the administrator account for this computer."
        : "Sign in to access the local mentorship program.";
    confirmField.hidden = !setupRequired;
    confirmInput.required = setupRequired;
    confirmInput.value = "";
    password.autocomplete = setupRequired ? "new-password" : "current-password";
    submit.textContent = setupRequired ? "Create account" : "Sign in";
    document.getElementById("loginMessage").textContent = setupRequired
        ? "Choose a username and a password of at least 12 characters. This account is stored only on this computer."
        : "";
}

function updateAuthenticatedUI(username) {
    isAuthenticated = true;
    document.getElementById("loginButton").textContent = "Log out";
    document.getElementById("loginButton").setAttribute(
        "aria-label",
        `Log out ${username}`
    );
    document.getElementById("closeLoginButton").hidden = false;
    document.getElementById("mentorAdminPrompt").hidden = true;
    document.getElementById("mentorManagement").hidden = false;
}

async function initializeAuthentication() {
    try {
        const status = await apiRequest("/api/auth/status");
        if (status.authenticated) {
            csrfToken = status.csrfToken;
            updateAuthenticatedUI(status.username);
            return loadDashboardData();
        }
        setLoginMode(status.setupRequired);
        return false;
    } catch (error) {
        setLoginMode(false);
        document.getElementById("loginMessage").textContent =
            `Cannot connect to the local app: ${error.message} Start it with python server.py and refresh this page.`;
        return false;
    }
}

async function logout() {
    if (!isAuthenticated || !window.confirm("Log out of the mentorship program on this browser?")) {
        return;
    }
    try {
        await apiRequest("/api/auth/logout", {
            method: "POST",
            body: JSON.stringify({})
        });
        csrfToken = "";
        window.location.reload();
    } catch (error) {
        setDataMessage(`Could not sign out: ${error.message}`, true);
    }
}

function setDataMessage(message, isError = false) {
    const element = document.getElementById("dataMessage");
    element.textContent = message;
    element.classList.toggle("error", isError);
}

const programSessionForm = document.getElementById("programSessionForm");
const programCalendarBody = document.querySelector(".program-calendar tbody");
const calendarMessage = document.getElementById("calendarMessage");
const programOwnerStorageKey = "youth-mentorship-program-owner";
const programAudience = document.getElementById("programAudience");
const programGroupNameField = document.getElementById("programGroupNameField");
const programGroupName = document.getElementById("programGroupName");
const programAudienceSummary = document.getElementById("programAudienceSummary");
let editingScheduleId = null;

function updateGroupNameField() {
    const needsGroupName = ["church", "organization", "other"].includes(
        programAudience.value
    );
    programGroupNameField.hidden = !needsGroupName;
    programGroupName.required = needsGroupName;

    const audienceLabels = {
        self: "a personal mentorship program",
        church: "my church",
        organization: "my organization",
        other: "another group"
    };
    const groupName = programGroupName.value.trim();
    const audienceLabel = audienceLabels[programAudience.value];
    programAudienceSummary.textContent = needsGroupName && groupName
        ? `Planning this program for ${groupName}.`
        : `Planning ${audienceLabel}.`;
}

function loadProgramOwner() {
    try {
        const savedOwner = localStorage.getItem(programOwnerStorageKey);
        if (!savedOwner) {
            updateGroupNameField();
            return;
        }

        const owner = JSON.parse(savedOwner);
        const validAudiences = ["self", "church", "organization", "other"];
        if (
            !owner ||
            !validAudiences.includes(owner.audience) ||
            typeof owner.groupName !== "string" ||
            owner.groupName.length > 100
        ) {
            throw new Error("Saved program audience is invalid.");
        }

        programAudience.value = owner.audience;
        programGroupName.value = owner.groupName;
        updateGroupNameField();
    } catch (error) {
        calendarMessage.textContent =
            "The saved program audience could not be loaded. Choose who the program is for and save your choice again.";
        console.error("Unable to read the saved program audience.", error);
        updateGroupNameField();
    }
}

function saveProgramOwner() {
    try {
        localStorage.setItem(
            programOwnerStorageKey,
            JSON.stringify({
                audience: programAudience.value,
                groupName: programGroupName.value.trim()
            })
        );
        calendarMessage.textContent = "Program audience saved in this browser.";
    } catch (error) {
        calendarMessage.textContent =
            "The program audience changed on this page, but this browser could not save it.";
        console.error("Unable to save the program audience.", error);
    }
}

programAudience.addEventListener("change", () => {
    if (programAudience.value === "self") {
        programGroupName.value = "";
    }
    updateGroupNameField();
    saveProgramOwner();
});

programGroupName.addEventListener("input", updateGroupNameField);
programGroupName.addEventListener("change", saveProgramOwner);
loadProgramOwner();

function timeToMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function formatTime(value) {
    const [hours, minutes] = value.split(":").map(Number);
    const period = hours < 12 ? "AM" : "PM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatScheduleDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return {
        day: String(day),
        month: new Date(year, month - 1, day).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric"
        })
    };
}

function getSampleSchedule() {
    return Array.from(programCalendarBody.rows, (row, index) => {
        const cells = row.cells;
        const date = cells[0].querySelector("time").dateTime;
        const timeText = cells[4].textContent.trim();
        const timeParts = timeText.match(
            /(\d{1,2}):(\d{2})\s*([AP]M)?\s*[–-]\s*(\d{1,2}):(\d{2})\s*([AP]M)/i
        );

        if (!timeParts) {
            throw new Error(`Cannot read the sample session time: ${timeText}`);
        }

        const toInputTime = (hour, minute, period) => {
            let hour24 = Number(hour) % 12;
            if (period.toUpperCase() === "PM") {
                hour24 += 12;
            }
            return `${String(hour24).padStart(2, "0")}:${minute}`;
        };

        return {
            id: index + 1,
            date,
            topic: cells[2].textContent.trim(),
            focus: cells[3].textContent.trim(),
            startTime: toInputTime(
                timeParts[1],
                timeParts[2],
                timeParts[3] || timeParts[6]
            ),
            endTime: toInputTime(timeParts[4], timeParts[5], timeParts[6])
        };
    });
}

function isValidSchedule(records) {
    return Array.isArray(records) && records.every((record) =>
        record &&
        Number.isSafeInteger(record.id) &&
        /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
        !Number.isNaN(Date.parse(`${record.date}T00:00:00`)) &&
        typeof record.topic === "string" &&
        record.topic.trim().length > 0 &&
        record.topic.length <= 100 &&
        typeof record.focus === "string" &&
        record.focus.trim().length > 0 &&
        record.focus.length <= 240 &&
        /^\d{2}:\d{2}$/.test(record.startTime) &&
        /^\d{2}:\d{2}$/.test(record.endTime) &&
        timeToMinutes(record.endTime) > timeToMinutes(record.startTime)
    );
}

const sampleSchedule = getSampleSchedule();
let programSchedule = sampleSchedule;

async function saveProgramSchedule(nextSchedule, successMessage) {
    try {
        const savedSchedule = await apiRequest("/api/schedule", {
            method: "PUT",
            body: JSON.stringify(nextSchedule)
        });
        programSchedule = savedSchedule;
        calendarMessage.textContent = successMessage;
        renderProgramSchedule();
        return true;
    } catch (error) {
        calendarMessage.textContent = `Schedule was not saved: ${error.message}`;
        return false;
    }
}

function setCalendarFormMode(isEditing) {
    document.getElementById("calendarFormTitle").textContent = isEditing
        ? "Edit program session"
        : "Add a program session";
    document.getElementById("saveProgramSession").textContent = isEditing
        ? "Save changes"
        : "Add session";
    document.getElementById("cancelProgramEdit").hidden = !isEditing;
}

function resetSessionEditor() {
    const audience = programAudience.value;
    const groupName = programGroupName.value;
    programSessionForm.reset();
    programAudience.value = audience;
    programGroupName.value = groupName;
    updateGroupNameField();
    document.getElementById("programStartTime").value = "14:00";
    document.getElementById("programEndTime").value = "16:00";
}

function renderProgramSchedule() {
    programCalendarBody.replaceChildren();

    programSchedule
        .slice()
        .sort((first, second) =>
            first.date.localeCompare(second.date) ||
            first.startTime.localeCompare(second.startTime)
        )
        .forEach((record) => {
            const row = document.createElement("tr");
            const dateParts = formatScheduleDate(record.date);
            const dateCell = document.createElement("td");
            const timeElement = document.createElement("time");
            timeElement.dateTime = record.date;
            timeElement.textContent = dateParts.day;
            dateCell.append(timeElement);

            const monthCell = document.createElement("td");
            monthCell.textContent = dateParts.month;

            const topicCell = document.createElement("td");
            topicCell.textContent = record.topic;

            const focusCell = document.createElement("td");
            focusCell.textContent = record.focus;

            const timeCell = document.createElement("td");
            timeCell.textContent = `${formatTime(record.startTime)}–${formatTime(record.endTime)}`;

            const actionsCell = document.createElement("td");
            actionsCell.className = "calendar-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "calendar-action-btn";
            editButton.textContent = "Edit";
            editButton.setAttribute("aria-label", `Edit ${record.topic}`);
            editButton.addEventListener("click", () => {
                editingScheduleId = record.id;
                document.getElementById("programDate").value = record.date;
                document.getElementById("programTopic").value = record.topic;
                document.getElementById("programStartTime").value = record.startTime;
                document.getElementById("programEndTime").value = record.endTime;
                document.getElementById("programFocus").value = record.focus;
                setCalendarFormMode(true);
                programSessionForm.scrollIntoView({ behavior: "smooth", block: "center" });
                document.getElementById("programTopic").focus();
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "calendar-action-btn delete";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", `Delete ${record.topic}`);
            deleteButton.addEventListener("click", async () => {
                if (!window.confirm(`Delete the session "${record.topic}"?`)) {
                    return;
                }
                const nextSchedule = programSchedule.filter((item) => item.id !== record.id);
                if (editingScheduleId === record.id) {
                    if (!await saveProgramSchedule(nextSchedule, "Session deleted.")) {
                        return;
                    }
                    resetSessionEditor();
                    editingScheduleId = null;
                    setCalendarFormMode(false);
                    return;
                }
                await saveProgramSchedule(nextSchedule, "Session deleted.");
            });

            actionsCell.append(editButton, deleteButton);
            row.append(dateCell, monthCell, topicCell, focusCell, timeCell, actionsCell);
            programCalendarBody.append(row);
        });
}

programSessionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!await dashboardDataReady) {
        return;
    }
    const formData = new FormData(programSessionForm);
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    const endTimeInput = document.getElementById("programEndTime");

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        endTimeInput.setCustomValidity("End time must be later than the start time.");
        endTimeInput.reportValidity();
        return;
    }

    endTimeInput.setCustomValidity("");
    const updatedRecord = {
        id: editingScheduleId ?? Math.max(0, ...programSchedule.map((item) => item.id)) + 1,
        date: formData.get("date"),
        topic: formData.get("topic").trim(),
        focus: formData.get("focus").trim(),
        startTime,
        endTime
    };

    const nextSchedule = editingScheduleId === null
        ? [...programSchedule, updatedRecord]
        : programSchedule.map((record) =>
            record.id === editingScheduleId ? updatedRecord : record
        );
    const successMessage = editingScheduleId === null
        ? "Session added to the local database."
        : "Session updated in the local database.";
    if (!await saveProgramSchedule(nextSchedule, successMessage)) {
        return;
    }

    editingScheduleId = null;
    resetSessionEditor();
    setCalendarFormMode(false);
    renderProgramSchedule();
});

document.getElementById("programEndTime").addEventListener("input", (event) => {
    event.target.setCustomValidity("");
});

document.getElementById("cancelProgramEdit").addEventListener("click", () => {
    editingScheduleId = null;
    resetSessionEditor();
    setCalendarFormMode(false);
});

document.getElementById("resetProgramSchedule").addEventListener("click", async () => {
    if (!await dashboardDataReady) {
        return;
    }
    if (!window.confirm("Restore the original sample schedule? Your edited schedule will be replaced.")) {
        return;
    }
    const restoredSchedule = sampleSchedule.map((record) => ({ ...record }));
    if (!await saveProgramSchedule(restoredSchedule, "Sample schedule restored.")) {
        return;
    }
    editingScheduleId = null;
    resetSessionEditor();
    setCalendarFormMode(false);
});

document.getElementById("programDate").value = getLocalDateValue();

const sessionForm = document.getElementById("sessionForm");
const sessionList = document.getElementById("sessionList");
const sessionCount = document.getElementById("sessionCount");
const emptySessions = document.getElementById("emptySessions");
const sessionRecords = [];

function getLocalDateValue() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
}

function formatSessionDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function renderSessions() {
    sessionList.replaceChildren();
    emptySessions.hidden = sessionRecords.length > 0;
    sessionCount.textContent = `${sessionRecords.length} ${
        sessionRecords.length === 1 ? "entry" : "entries"
    }`;

    sessionRecords
        .slice()
        .sort((first, second) => second.date.localeCompare(first.date))
        .forEach((record) => {
            const article = document.createElement("article");
            article.className = "session-card";

            const header = document.createElement("div");
            header.className = "session-card-header";

            const title = document.createElement("h4");
            title.textContent = record.topic;

            const status = document.createElement("span");
            status.className = `session-status ${record.status}`;
            status.textContent = record.status;

            header.append(title, status);
            article.append(header);

            const details = document.createElement("p");
            details.className = "session-details";
            details.textContent = `${formatSessionDate(record.date)} · ${
                record.attendance
            } attending · Progress: ${record.progress}`;
            article.append(details);

            if (record.followUpDate) {
                const followUp = document.createElement("p");
                followUp.className = "session-follow-up";
                followUp.textContent = `Next follow-up: ${formatSessionDate(
                    record.followUpDate
                )}`;
                article.append(followUp);
            }

            if (record.summary) {
                const summary = document.createElement("p");
                summary.className = "session-summary";
                summary.textContent = record.summary;
                article.append(summary);
            }

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-session";
            removeButton.textContent = "Remove";
            removeButton.setAttribute("aria-label", `Remove ${record.topic}`);
            removeButton.addEventListener("click", async () => {
                if (!await dashboardDataReady) {
                    return;
                }
                const recordIndex = sessionRecords.findIndex(
                    (item) => item.id === record.id
                );
                if (recordIndex !== -1) {
                    try {
                        await apiRequest(`/api/sessions/${record.id}`, {
                            method: "DELETE"
                        });
                    } catch (error) {
                        setDataMessage(`Session was not removed: ${error.message}`, true);
                        return;
                    }
                    sessionRecords.splice(recordIndex, 1);
                    renderSessions();
                    setDataMessage("Session removed from the local database.");
                }
            });
            article.append(removeButton);
            sessionList.append(article);
        });
}

sessionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!await dashboardDataReady) {
        return;
    }

    const formData = new FormData(sessionForm);
    const date = formData.get("sessionDate");
    const followUpDate = formData.get("followUpDate");

    if (followUpDate && followUpDate < date) {
        document
            .getElementById("followUpDate")
            .setCustomValidity("Follow-up date must be on or after the session date.");
        document.getElementById("followUpDate").reportValidity();
        return;
    }

    document.getElementById("followUpDate").setCustomValidity("");
    const record = {
        date,
        topic: formData.get("sessionTopic").trim(),
        attendance: Number(formData.get("attendanceCount")),
        status: formData.get("sessionStatus"),
        progress: formData.get("progressStatus"),
        followUpDate,
        summary: formData.get("sessionSummary").trim()
    };
    try {
        const savedRecord = await apiRequest("/api/sessions", {
            method: "POST",
            body: JSON.stringify(record)
        });
        sessionRecords.push(savedRecord);
    } catch (error) {
        setDataMessage(`Session was not saved: ${error.message}`, true);
        return;
    }
    sessionForm.reset();
    document.getElementById("sessionDate").value = getLocalDateValue();
    renderSessions();
    setDataMessage("Session added to the local database.");
});

document.getElementById("followUpDate").addEventListener("input", (event) => {
    event.target.setCustomValidity("");
});

document.getElementById("sessionDate").value = getLocalDateValue();

const mentorshipRequestForm = document.getElementById("mentorshipRequestForm");
const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const emptyRequests = document.getElementById("emptyRequests");
const mentorshipRequests = [];

const mentorTopics = [
    "Confidence and self-esteem",
    "Education and career planning",
    "Healthy relationships and boundaries",
    "Emotional wellbeing and asking for support",
    "Faith, values, and personal growth",
    "Leadership and life skills",
    "Study skills and time management",
    "Financial literacy"
];
const mentorPlans = [];
const mentorBookings = [];
const mentorSearch = document.getElementById("mentorSearch");
const mentorTopicFilter = document.getElementById("mentorTopicFilter");
const mentorDateFilter = document.getElementById("mentorDateFilter");
const mentorPlanCards = document.getElementById("mentorPlanCards");
const mentorDirectoryMessage = document.getElementById("mentorDirectoryMessage");
const mentorDashboardMessage = document.getElementById("mentorDashboardMessage");
const mentorPlanList = document.getElementById("mentorPlanList");
const bookingList = document.getElementById("bookingList");

mentorTopics.forEach((topic) => {
    mentorTopicFilter.add(new Option(topic, topic));
});
mentorDateFilter.min = getLocalDateValue();
document.getElementById("mentorSessionDate").min = getLocalDateValue();

function getMentorTopicValues(plan) {
    return [...new Set([
        plan.sessionTopic,
        ...plan.topics.split(",").map((topic) => topic.trim()).filter(Boolean)
    ])];
}

function renderMentorPlans() {
    mentorPlanCards.replaceChildren();
    const searchTerm = mentorSearch.value.trim().toLocaleLowerCase();
    const topicFilter = mentorTopicFilter.value.toLocaleLowerCase();
    const dateFilter = mentorDateFilter.value;
    const today = getLocalDateValue();
    const visiblePlans = mentorPlans.filter((plan) => {
        const searchable = [
            plan.mentorName,
            plan.specialty,
            plan.topics,
            plan.sessionTopic,
            plan.focus
        ].join(" ").toLocaleLowerCase();
        const topicMatches = !topicFilter || getMentorTopicValues(plan)
            .some((topic) => topic.toLocaleLowerCase().includes(topicFilter));
        return plan.sessionDate >= today &&
            (!searchTerm || searchable.includes(searchTerm)) &&
            topicMatches &&
            (!dateFilter || plan.sessionDate === dateFilter);
    });

    if (!mentorPlans.length) {
        mentorDirectoryMessage.textContent =
            "There are no mentor plans yet. Check back soon for upcoming sessions.";
    } else if (!visiblePlans.length) {
        mentorDirectoryMessage.textContent =
            "No upcoming sessions match those filters. Try another topic or date.";
    } else {
        mentorDirectoryMessage.textContent =
            `${visiblePlans.length} upcoming ${visiblePlans.length === 1 ? "session" : "sessions"} available to explore.`;
    }

    visiblePlans.forEach((plan) => {
        const article = document.createElement("article");
        article.className = "mentor-card";

        const name = document.createElement("h3");
        name.textContent = plan.mentorName;

        const specialty = document.createElement("p");
        specialty.className = "mentor-specialty";
        specialty.textContent = plan.specialty;

        const sessionTitle = document.createElement("p");
        sessionTitle.className = "mentor-session-title";
        sessionTitle.textContent = plan.sessionTopic;

        const availability = document.createElement("p");
        availability.className = "mentor-availability";
        availability.textContent =
            `${formatSessionDate(plan.sessionDate)} · ${formatTime(plan.startTime)}–${formatTime(plan.endTime)} EAT · ${plan.available} ${plan.available === 1 ? "place" : "places"} left`;

        const about = document.createElement("p");
        about.textContent = plan.bio;

        const focus = document.createElement("p");
        focus.textContent = `Session plan: ${plan.focus}`;

        const topics = document.createElement("p");
        topics.textContent = `Topics: ${plan.topics}`;

        article.append(name, specialty, sessionTitle, availability, about, focus, topics);

        const bookingForm = document.createElement("form");
        bookingForm.className = "mentor-booking-form";
        const aliasLabel = document.createElement("label");
        aliasLabel.htmlFor = `bookingAlias-${plan.id}`;
        aliasLabel.textContent = "First name or group alias";
        const aliasInput = document.createElement("input");
        aliasInput.id = `bookingAlias-${plan.id}`;
        aliasInput.name = "attendeeAlias";
        aliasInput.maxLength = 60;
        aliasInput.autocomplete = "off";
        aliasInput.required = true;
        aliasInput.placeholder = "Use a non-identifying alias";
        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.name = "attendeeCount";
        countInput.min = "1";
        countInput.max = String(plan.available);
        countInput.value = "1";
        countInput.required = true;
        countInput.setAttribute("aria-label", "Number of places to reserve");
        const bookButton = document.createElement("button");
        bookButton.type = "submit";
        bookButton.textContent = plan.available > 0 ? "Book this session" : "Fully booked";
        bookButton.disabled = plan.available === 0;
        const feedback = document.createElement("p");
        feedback.className = "mentor-booking-feedback";
        feedback.setAttribute("role", "status");
        feedback.setAttribute("aria-live", "polite");
        bookingForm.append(aliasLabel, aliasInput, countInput, bookButton, feedback);
        bookingForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            bookButton.disabled = true;
            feedback.textContent = "Submitting your booking…";
            try {
                await apiRequest("/api/bookings", {
                    method: "POST",
                    body: JSON.stringify({
                        planId: plan.id,
                        attendeeAlias: aliasInput.value.trim(),
                        attendeeCount: Number(countInput.value)
                    })
                });
            } catch (error) {
                feedback.textContent = `Booking could not be completed: ${error.message}`;
                bookButton.disabled = false;
                return;
            }
            bookingForm.reset();
            const directoryLoaded = await loadMentorDirectory();
            mentorDirectoryMessage.textContent = directoryLoaded
                ? "Your place is reserved. Thank you!"
                : "Your booking was saved, but session availability could not be refreshed.";
            if (isAuthenticated) {
                try {
                    await loadMentorBookings();
                } catch (error) {
                    mentorDashboardMessage.textContent =
                        `Your booking was saved, but the booking dashboard could not be refreshed: ${error.message}`;
                }
            }
            bookButton.disabled = false;
        });
        article.append(bookingForm);
        mentorPlanCards.append(article);
    });
}

async function loadMentorDirectory() {
    try {
        const records = await apiRequest("/api/mentors");
        if (!Array.isArray(records)) {
            throw new Error("The mentor API returned data in an unexpected format.");
        }
        mentorPlans.splice(0, mentorPlans.length, ...records);
        renderMentorPlans();
        renderManagedMentorPlans();
        return true;
    } catch (error) {
        mentorDirectoryMessage.textContent = `Mentor plans could not be loaded: ${error.message}`;
        return false;
    }
}

function renderManagedMentorPlans() {
    mentorPlanList.replaceChildren();
    const upcomingPlans = mentorPlans.filter(
        (plan) => plan.sessionDate >= getLocalDateValue()
    );
    document.getElementById("emptyMentorPlans").hidden = upcomingPlans.length > 0;
    document.getElementById("mentorPlanCount").textContent =
        `${upcomingPlans.length} ${upcomingPlans.length === 1 ? "plan" : "plans"}`;
    upcomingPlans.forEach((plan) => {
        const card = document.createElement("article");
        card.className = "mentor-admin-card";
        const title = document.createElement("h4");
        title.textContent = `${plan.mentorName} · ${plan.sessionTopic}`;
        const details = document.createElement("p");
        details.textContent =
            `${formatSessionDate(plan.sessionDate)} · ${formatTime(plan.startTime)}–${formatTime(plan.endTime)} EAT · ${plan.available}/${plan.capacity} places remaining`;
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "calendar-action-btn delete";
        removeButton.textContent = "Remove plan";
        removeButton.addEventListener("click", async () => {
            if (!window.confirm(`Remove ${plan.mentorName}'s "${plan.sessionTopic}" plan and its bookings?`)) {
                return;
            }
            try {
                await apiRequest(`/api/mentors/${plan.id}`, { method: "DELETE" });
                mentorDashboardMessage.textContent = "Mentor plan and its bookings removed.";
                await loadMentorDirectory();
                await loadMentorBookings();
            } catch (error) {
                mentorDashboardMessage.textContent =
                    `Mentor plan was not removed: ${error.message}`;
            }
        });
        card.append(title, details, removeButton);
        mentorPlanList.append(card);
    });
}

function renderMentorBookings() {
    bookingList.replaceChildren();
    document.getElementById("emptyBookings").hidden = mentorBookings.length > 0;
    document.getElementById("bookingCount").textContent =
        `${mentorBookings.length} ${mentorBookings.length === 1 ? "booking" : "bookings"}`;
    mentorBookings.forEach((booking) => {
        const card = document.createElement("article");
        card.className = "mentor-admin-card";
        const title = document.createElement("h4");
        title.textContent = `${booking.attendeeAlias} · ${booking.mentorName}`;
        const details = document.createElement("p");
        details.textContent =
            `${booking.sessionTopic} · ${formatSessionDate(booking.sessionDate)} · ${formatTime(booking.startTime)}–${formatTime(booking.endTime)} EAT · ${booking.attendeeCount} ${booking.attendeeCount === 1 ? "place" : "places"}`;
        card.append(title, details);
        bookingList.append(card);
    });
}

async function loadMentorBookings() {
    const records = await apiRequest("/api/bookings");
    if (!Array.isArray(records)) {
        throw new Error("The booking API returned data in an unexpected format.");
    }
    mentorBookings.splice(0, mentorBookings.length, ...records);
    renderMentorBookings();
}

[mentorSearch, mentorTopicFilter, mentorDateFilter].forEach((filter) => {
    filter.addEventListener("input", renderMentorPlans);
    filter.addEventListener("change", renderMentorPlans);
});

document.getElementById("mentorPlanForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!await dashboardDataReady) {
        return;
    }
    const formData = new FormData(form);
    const startTime = formData.get("startTime");
    const endTime = formData.get("endTime");
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        const endInput = document.getElementById("mentorEndTime");
        endInput.setCustomValidity("End time must be later than the start time.");
        endInput.reportValidity();
        return;
    }
    document.getElementById("mentorEndTime").setCustomValidity("");
    const record = {
        mentorName: formData.get("mentorName").trim(),
        specialty: formData.get("specialty").trim(),
        topics: formData.get("topics").trim(),
        bio: formData.get("bio").trim(),
        sessionDate: formData.get("sessionDate"),
        sessionTopic: formData.get("sessionTopic").trim(),
        focus: formData.get("focus").trim(),
        startTime,
        endTime,
        capacity: Number(formData.get("capacity"))
    };
    try {
        await apiRequest("/api/mentors", {
            method: "POST",
            body: JSON.stringify(record)
        });
        form.reset();
        document.getElementById("mentorStartTime").value = "14:00";
        document.getElementById("mentorEndTime").value = "15:00";
        document.getElementById("mentorCapacity").value = "1";
        document.getElementById("mentorSessionDate").min = getLocalDateValue();
        mentorDashboardMessage.textContent = "Your session plan is now visible in the mentor directory.";
        await loadMentorDirectory();
    } catch (error) {
        mentorDashboardMessage.textContent = `Mentor plan was not published: ${error.message}`;
    }
});

document.getElementById("mentorEndTime").addEventListener("input", (event) => {
    event.target.setCustomValidity("");
});

function renderMentorshipRequests() {
    requestList.replaceChildren();
    emptyRequests.hidden = mentorshipRequests.length > 0;
    requestCount.textContent = `${mentorshipRequests.length} ${
        mentorshipRequests.length === 1 ? "request" : "requests"
    }`;

    mentorshipRequests
        .slice()
        .reverse()
        .forEach((request) => {
            const article = document.createElement("article");
            article.className = "request-card";

            const title = document.createElement("h4");
            title.textContent = request.groupName
                ? `${request.groupType}: ${request.groupName}`
                : request.groupType;

            const details = document.createElement("p");
            details.textContent = `${request.ageGroup} · Requested topic: ${request.topic}`;

            const support = document.createElement("p");
            support.textContent = `Support requested: ${request.support}`;

            const topicControl = document.createElement("div");
            topicControl.className = "request-topic-control";

            const topicLabel = document.createElement("label");
            topicLabel.htmlFor = `mentorTopic-${request.id}`;
            topicLabel.textContent = "Topic you will discuss with them";

            const topicSelect = document.createElement("select");
            topicSelect.id = `mentorTopic-${request.id}`;
            topicSelect.setAttribute("aria-label", "Select a mentor discussion topic");
            topicSelect.add(new Option("Choose a discussion topic", ""));
            mentorTopics.forEach((topic) => {
                topicSelect.add(new Option(topic, topic));
            });
            topicSelect.value = request.mentorTopic;

            const actions = document.createElement("div");
            actions.className = "request-topic-actions";

            const saveTopic = document.createElement("button");
            saveTopic.type = "button";
            saveTopic.className = "calendar-action-btn";
            saveTopic.textContent = "Set mentor topic";

            const savedMessage = document.createElement("p");
            savedMessage.textContent = request.mentorTopic
                ? `Mentor topic: ${request.mentorTopic}`
                : "";
            savedMessage.hidden = !request.mentorTopic;
            savedMessage.setAttribute("aria-live", "polite");

            saveTopic.addEventListener("click", async () => {
                if (!await dashboardDataReady) {
                    return;
                }
                if (!topicSelect.value) {
                    topicSelect.setCustomValidity("Choose a topic to discuss.");
                    topicSelect.reportValidity();
                    return;
                }
                topicSelect.setCustomValidity("");
                try {
                    const savedRequest = await apiRequest(
                        `/api/requests/${request.id}`,
                        {
                            method: "PATCH",
                            body: JSON.stringify({ mentorTopic: topicSelect.value })
                        }
                    );
                    request.mentorTopic = savedRequest.mentorTopic;
                } catch (error) {
                    setDataMessage(`Mentor topic was not saved: ${error.message}`, true);
                    return;
                }
                savedMessage.textContent = `Mentor topic: ${request.mentorTopic}`;
                savedMessage.hidden = false;
                setDataMessage("Mentor topic saved.");
            });

            topicSelect.addEventListener("change", () => {
                topicSelect.setCustomValidity("");
            });

            actions.append(saveTopic, savedMessage);
            topicControl.append(topicLabel, topicSelect, actions);
            article.append(title, details, support, topicControl);
            requestList.append(article);
        });
}

mentorshipRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!await dashboardDataReady) {
        return;
    }
    const formData = new FormData(mentorshipRequestForm);
    const record = {
        groupType: formData.get("groupType"),
        groupName: formData.get("groupName").trim(),
        ageGroup: formData.get("ageGroup"),
        topic: formData.get("topic"),
        support: formData.get("support").trim(),
        mentorTopic: ""
    };
    try {
        const savedRequest = await apiRequest("/api/requests", {
            method: "POST",
            body: JSON.stringify(record)
        });
        mentorshipRequests.push(savedRequest);
    } catch (error) {
        setDataMessage(`Request was not saved: ${error.message}`, true);
        return;
    }
    mentorshipRequestForm.reset();
    renderMentorshipRequests();
    setDataMessage("Request saved in the local database.");
});

async function loadDashboardData() {
    try {
        const [requests, sessions, scheduleData, bookings, plans] = await Promise.all([
            apiRequest("/api/requests"),
            apiRequest("/api/sessions"),
            apiRequest("/api/schedule"),
            apiRequest("/api/bookings"),
            apiRequest("/api/mentors")
        ]);
        if (
            !Array.isArray(requests) ||
            !Array.isArray(sessions) ||
            !Array.isArray(bookings) ||
            !Array.isArray(plans) ||
            !scheduleData ||
            !Array.isArray(scheduleData.records)
        ) {
            throw new Error("The local API returned data in an unexpected format.");
        }

        if (!scheduleData.initialized) {
            scheduleData.records = await apiRequest("/api/schedule", {
                method: "PUT",
                body: JSON.stringify(sampleSchedule)
            });
        }
        if (!isValidSchedule(scheduleData.records)) {
            throw new Error("The saved schedule has an invalid format.");
        }

        mentorshipRequests.splice(0, mentorshipRequests.length, ...requests);
        sessionRecords.splice(0, sessionRecords.length, ...sessions);
        mentorPlans.splice(0, mentorPlans.length, ...plans);
        mentorBookings.splice(0, mentorBookings.length, ...bookings);
        programSchedule = scheduleData.records;
        renderMentorshipRequests();
        renderSessions();
        renderProgramSchedule();
        renderMentorPlans();
        renderManagedMentorPlans();
        renderMentorBookings();
        setDataMessage("Connected to the local SQLite database.");
        return true;
    } catch (error) {
        const message = `Could not load local data: ${error.message} Start the app with python server.py and open http://127.0.0.1:8000.`;
        setDataMessage(message, true);
        calendarMessage.textContent = message;
        renderMentorshipRequests();
        renderSessions();
        return false;
    }
}

dashboardDataReady = new Promise((resolve) => {
    resolveDashboardDataReady = resolve;
});

document.getElementById("loginButton").addEventListener("click", () => {
    if (isAuthenticated) {
        logout();
    } else {
        showLogin();
    }
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const setupRequired = !document.getElementById("confirmPasswordField").hidden;
    const formData = new FormData(event.currentTarget);
    const credentials = {
        username: formData.get("username").trim(),
        password: formData.get("password")
    };
    if (setupRequired) {
        credentials.confirmPassword = formData.get("confirmPassword");
    }
    const submitButton = document.getElementById("loginSubmit");
    const loginMessage = document.getElementById("loginMessage");
    submitButton.disabled = true;
    loginMessage.textContent = setupRequired
        ? "Creating your account…"
        : "Signing in…";
    try {
        const result = await apiRequest(
            setupRequired ? "/api/auth/setup" : "/api/auth/login",
            {
                method: "POST",
                body: JSON.stringify(credentials)
            }
        );
        csrfToken = result.csrfToken;
        updateAuthenticatedUI(result.username);
        const loaded = await loadDashboardData();
        resolveDashboardDataReady(loaded);
        if (loaded) {
            document.getElementById("loginPassword").value = "";
            document.getElementById("confirmPassword").value = "";
            loginMessage.textContent = "";
            closeLogin();
        } else {
            loginMessage.textContent =
                "Signed in, but the records could not be loaded. Refresh the page and try again.";
        }
    } catch (error) {
        loginMessage.textContent = error.message;
        if (error.message.includes("already set up")) {
            setLoginMode(false);
            loginMessage.textContent =
                "This local account was set up in another tab. Sign in with that account.";
        }
    } finally {
        submitButton.disabled = false;
    }
});

document.getElementById("closeLoginButton").addEventListener("click", closeLogin);

initializeAuthentication().then((loaded) => {
    if (isAuthenticated) {
        resolveDashboardDataReady(loaded);
    }
});

loadMentorDirectory();

document.getElementById("exportData").addEventListener("click", async () => {
    if (!await dashboardDataReady) {
        return;
    }
    try {
        const backup = await apiRequest("/api/export");
        const url = URL.createObjectURL(
            new Blob([JSON.stringify(backup, null, 2)], {
                type: "application/json"
            })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `mentorship-backup-${getLocalDateValue()}.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDataMessage("JSON backup downloaded.");
    } catch (error) {
        setDataMessage(`Backup could not be exported: ${error.message}`, true);
    }
});

const importDataInput = document.getElementById("importDataFile");
document.getElementById("importData").addEventListener("click", () => {
    importDataInput.click();
});

importDataInput.addEventListener("change", async () => {
    const file = importDataInput.files[0];
    importDataInput.value = "";
    if (!file) {
        return;
    }
    if (!await dashboardDataReady) {
        return;
    }
    if (file.size > 50_000_000) {
        setDataMessage("The JSON backup must be 50 MB or smaller.", true);
        return;
    }
    if (!window.confirm("Importing replaces all current requests, tracker entries, and scheduled sessions. Continue?")) {
        return;
    }
    try {
        const backup = JSON.parse(await file.text());
        await apiRequest("/api/import", {
            method: "POST",
            body: JSON.stringify(backup)
        });
        if (await loadDashboardData()) {
            setDataMessage("JSON backup imported successfully.");
        }
    } catch (error) {
        setDataMessage(`Backup could not be imported: ${error.message}`, true);
    }
});

window.addEventListener("click", function(event) {

    const modal = document.getElementById("loginModal");

    if (event.target === modal) {
        closeLogin();
    }

});
