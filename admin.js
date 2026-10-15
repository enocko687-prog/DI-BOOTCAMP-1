"use strict";

const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const requestList = document.getElementById("requestList");
const requestCount = document.getElementById("requestCount");
const adminMessage = document.getElementById("adminMessage");

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The website returned an unreadable response. Please try again.");
  }
  if (!response.ok) {
    if (response.status === 401) {
      showLogin();
    }
    throw new Error(result.error || "The request could not be completed.");
  }
  return result;
}

function setMessage(message, isError = false) {
  adminMessage.textContent = message;
  adminMessage.classList.toggle("is-error", isError);
}

function showLogin() {
  loginForm.hidden = false;
  dashboard.hidden = true;
  loginForm.reset();
}

function showDashboard() {
  loginForm.hidden = true;
  dashboard.hidden = false;
}

function makeRequestCard(request) {
  const card = document.createElement("article");
  card.className = "request-card";

  const header = document.createElement("div");
  header.className = "request-card-header";
  const headingGroup = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = request.name || "Anonymous request";
  const meta = document.createElement("p");
  meta.className = "request-meta";
  meta.textContent = [
    request.category,
    request.email || "No email provided",
  ].join(" · ");
  headingGroup.append(title, meta);

  const date = document.createElement("time");
  date.className = "request-date";
  date.dateTime = request.createdAt;
  date.textContent = new Date(request.createdAt).toLocaleString();
  header.append(headingGroup, date);

  const message = document.createElement("p");
  message.className = "request-message";
  message.textContent = request.message;

  const controls = document.createElement("div");
  controls.className = "request-controls";
  const status = document.createElement("select");
  status.setAttribute("aria-label", `Status for ${request.name || "anonymous request"}`);
  [
    ["new", "New"],
    ["prayed", "Prayed"],
    ["contacted", "Contacted"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    status.append(option);
  });
  status.value = request.status;
  status.addEventListener("change", async () => {
    status.disabled = true;
    try {
      await apiRequest(`/api/staff/prayer-requests/${encodeURIComponent(request._id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: status.value }),
      });
      setMessage("Prayer request status updated.");
    } catch (error) {
      setMessage(error.message, true);
      status.value = request.status;
    } finally {
      status.disabled = false;
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    if (!window.confirm("Permanently delete this prayer request?")) {
      return;
    }
    deleteButton.disabled = true;
    try {
      await apiRequest(`/api/staff/prayer-requests/${encodeURIComponent(request._id)}`, {
        method: "DELETE",
      });
      card.remove();
      requestCount.textContent = `${requestList.children.length} prayer requests`;
      setMessage("Prayer request deleted.");
      if (!requestList.children.length) {
        requestList.textContent = "No prayer requests have been submitted.";
      }
    } catch (error) {
      setMessage(error.message, true);
      deleteButton.disabled = false;
    }
  });

  controls.append(status, deleteButton);
  card.append(header, message, controls);
  return card;
}

async function loadRequests() {
  setMessage("Loading prayer requests...");
  requestList.replaceChildren();
  try {
    const result = await apiRequest("/api/staff/prayer-requests");
    const requests = result.requests;
    requestCount.textContent = `${requests.length} prayer request${requests.length === 1 ? "" : "s"} (latest 100)`;
    if (!requests.length) {
      requestList.textContent = "No prayer requests have been submitted.";
    } else {
      requestList.append(...requests.map(makeRequestCard));
    }
    setMessage("");
  } catch (error) {
    if (loginForm.hidden) {
      setMessage(error.message, true);
    }
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setMessage("Signing in...");
  try {
    await apiRequest("/api/staff/login", {
      method: "POST",
      body: JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      }),
    });
    showDashboard();
    await loadRequests();
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById("refreshRequests").addEventListener("click", loadRequests);

document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await apiRequest("/api/staff/logout", { method: "POST" });
    showLogin();
    setMessage("You have signed out.");
  } catch (error) {
    setMessage(error.message, true);
  }
});

async function initialize() {
  loginForm.hidden = true;
  dashboard.hidden = true;
  try {
    const result = await apiRequest("/api/staff/session");
    if (result.authenticated) {
      showDashboard();
      await loadRequests();
    } else {
      showLogin();
    }
  } catch (error) {
    showLogin();
    setMessage(
      error instanceof TypeError
        ? "Could not connect to the backend. Start the website server and try again."
        : error.message,
      true
    );
  }
}

initialize();
