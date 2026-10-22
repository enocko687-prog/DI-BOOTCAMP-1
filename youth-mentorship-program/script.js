function showLogin() {
    const modal = document.getElementById("loginModal");

    modal.style.display = "flex";
}


function closeLogin() {
    const modal = document.getElementById("loginModal");

    modal.style.display = "none";
}

const programSessionForm = document.getElementById("programSessionForm");
const programCalendarBody = document.querySelector(".program-calendar tbody");
const calendarMessage = document.getElementById("calendarMessage");
const calendarStorageKey = "youth-mentorship-program-schedule";
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

try {
    const savedSchedule = localStorage.getItem(calendarStorageKey);
    if (savedSchedule !== null) {
        const parsedSchedule = JSON.parse(savedSchedule);
        if (isValidSchedule(parsedSchedule)) {
            programSchedule = parsedSchedule;
        } else {
            calendarMessage.textContent =
                "Saved schedule data was invalid. The sample schedule is shown; restore it to replace the invalid saved copy.";
        }
    }
} catch (error) {
    calendarMessage.textContent =
        "This browser could not read the saved schedule. You can still edit it now, but changes may not persist after closing the page.";
    console.error("Unable to read the saved mentorship schedule.", error);
}

function saveProgramSchedule(successMessage) {
    try {
        localStorage.setItem(calendarStorageKey, JSON.stringify(programSchedule));
        calendarMessage.textContent = successMessage;
    } catch (error) {
        calendarMessage.textContent =
            "The schedule changed on this page, but this browser could not save it. Keep a separate copy before closing the page.";
        console.error("Unable to save the mentorship schedule.", error);
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
            deleteButton.addEventListener("click", () => {
                if (!window.confirm(`Delete the session "${record.topic}"?`)) {
                    return;
                }
                programSchedule = programSchedule.filter((item) => item.id !== record.id);
                if (editingScheduleId === record.id) {
                    resetSessionEditor();
                    editingScheduleId = null;
                    setCalendarFormMode(false);
                }
                saveProgramSchedule("Session deleted.");
                renderProgramSchedule();
            });

            actionsCell.append(editButton, deleteButton);
            row.append(dateCell, monthCell, topicCell, focusCell, timeCell, actionsCell);
            programCalendarBody.append(row);
        });
}

programSessionForm.addEventListener("submit", (event) => {
    event.preventDefault();
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

    if (editingScheduleId === null) {
        programSchedule.push(updatedRecord);
        saveProgramSchedule("Session added and saved in this browser.");
    } else {
        programSchedule = programSchedule.map((record) =>
            record.id === editingScheduleId ? updatedRecord : record
        );
        saveProgramSchedule("Session updated and saved in this browser.");
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

document.getElementById("resetProgramSchedule").addEventListener("click", () => {
    if (!window.confirm("Restore the original sample schedule? Your edited schedule will be replaced.")) {
        return;
    }
    programSchedule = sampleSchedule.map((record) => ({ ...record }));
    editingScheduleId = null;
    resetSessionEditor();
    setCalendarFormMode(false);
    saveProgramSchedule("Sample schedule restored and saved in this browser.");
    renderProgramSchedule();
});

document.getElementById("programDate").value = getLocalDateValue();
renderProgramSchedule();

const sessionForm = document.getElementById("sessionForm");
const sessionList = document.getElementById("sessionList");
const sessionCount = document.getElementById("sessionCount");
const emptySessions = document.getElementById("emptySessions");
const sessionRecords = [];
let nextSessionId = 1;

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
            removeButton.addEventListener("click", () => {
                const recordIndex = sessionRecords.findIndex(
                    (item) => item.id === record.id
                );
                if (recordIndex !== -1) {
                    sessionRecords.splice(recordIndex, 1);
                    renderSessions();
                }
            });
            article.append(removeButton);
            sessionList.append(article);
        });
}

sessionForm.addEventListener("submit", (event) => {
    event.preventDefault();

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
    sessionRecords.push({
        id: nextSessionId++,
        date,
        topic: formData.get("sessionTopic").trim(),
        attendance: Number(formData.get("attendanceCount")),
        status: formData.get("sessionStatus"),
        progress: formData.get("progressStatus"),
        followUpDate,
        summary: formData.get("sessionSummary").trim()
    });
    sessionForm.reset();
    document.getElementById("sessionDate").value = getLocalDateValue();
    renderSessions();
});

document.getElementById("followUpDate").addEventListener("input", (event) => {
    event.target.setCustomValidity("");
});

document.getElementById("sessionDate").value = getLocalDateValue();
renderSessions();

const mentorshipRequestForm = document.getElementById("mentorshipRequestForm");
const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const emptyRequests = document.getElementById("emptyRequests");
const mentorshipRequests = [];
let nextRequestId = 1;

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

            saveTopic.addEventListener("click", () => {
                if (!topicSelect.value) {
                    topicSelect.setCustomValidity("Choose a topic to discuss.");
                    topicSelect.reportValidity();
                    return;
                }
                topicSelect.setCustomValidity("");
                request.mentorTopic = topicSelect.value;
                savedMessage.textContent = `Mentor topic: ${request.mentorTopic}`;
                savedMessage.hidden = false;
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

mentorshipRequestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(mentorshipRequestForm);
    mentorshipRequests.push({
        id: nextRequestId++,
        groupType: formData.get("groupType"),
        groupName: formData.get("groupName").trim(),
        ageGroup: formData.get("ageGroup"),
        topic: formData.get("topic"),
        support: formData.get("support").trim(),
        mentorTopic: ""
    });
    mentorshipRequestForm.reset();
    renderMentorshipRequests();
});

renderMentorshipRequests();

window.addEventListener("click", function(event) {

    const modal = document.getElementById("loginModal");

    if (event.target === modal) {
        closeLogin();
    }

});
