const adminAuthKey = "teacherBevanAdminAuth";
const dashboardContent =
    document.getElementById("dashboardContent");

function adminHeaders(headers = {}, token) {
    const authToken =
        token || sessionStorage.getItem(adminAuthKey);

    return authToken
        ? { ...headers, Authorization: `Basic ${authToken}` }
        : headers;
}

function showDashboardNotice(message) {
    const notice = document.getElementById("dashboardNotice");
    notice.hidden = false;
    notice.textContent = message;
}

async function readResponse(response) {
    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return {
        error: (await response.text()) || "The server returned an unexpected response."
    };
}

document.getElementById("loginForm").addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const username = String(formData.get("username") || "");
        const password = String(formData.get("password") || "");
        const bytes = new TextEncoder().encode(
            `${username}:${password}`
        );
        let binary = "";

        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        const token = btoa(binary);
        const loginMessage =
            document.getElementById("loginMessage");

        try {
            const response = await fetch(
                "/api/admin/dashboard",
                {
                    headers: adminHeaders({}, token)
                }
            );
            const result = await readResponse(response);

            if (!response.ok) {
                loginMessage.textContent =
                    result.error || "Sign in failed. Check your username and password.";
                return;
            }

            sessionStorage.setItem(adminAuthKey, token);
            loginMessage.textContent = "";
            form.reset();
            await loadDashboard();
        } catch (error) {
            loginMessage.textContent =
                "Unable to contact the server. Please try again.";
            console.error(error);
        }
    }
);

document.getElementById("logoutButton").addEventListener(
    "click",
    () => {
        sessionStorage.removeItem(adminAuthKey);
        dashboardContent.hidden = true;
        document.getElementById("logoutButton").hidden = true;
        document.getElementById("loginPanel").hidden = false;
        showDashboardNotice("Sign in to manage the shop dashboard.");
    }
);

async function loadDashboard() {

    const notice =
        document.getElementById("dashboardNotice");
    let response;
    let data;

    try {
        response = await fetch(
            "/api/admin/dashboard",
            {
                headers: adminHeaders()
            }
        );
        data = await readResponse(response);
    } catch (error) {
        showDashboardNotice(
            "Unable to connect to the dashboard. Check that the website server is running and refresh."
        );
        console.error(error);
        return;
    }

    if (!response.ok) {
        if (response.status === 401) {
            sessionStorage.removeItem(adminAuthKey);
            dashboardContent.hidden = true;
            document.getElementById("loginPanel").hidden = false;
            document.getElementById("logoutButton").hidden = true;
            showDashboardNotice("Sign in to manage the shop dashboard.");
            return;
        }

        dashboardContent.hidden = true;
        showDashboardNotice(data.error || "Unable to load dashboard data.");
        document.getElementById("appointments").innerHTML =
            `<tr><td colspan="6">${escapeHTML(notice.textContent)}</td></tr>`;
        document.getElementById("requests").innerHTML =
            `<tr><td colspan="6">${escapeHTML(notice.textContent)}</td></tr>`;
        return;
    }

    document.getElementById("loginPanel").hidden = true;
    document.getElementById("logoutButton").hidden = false;
    dashboardContent.hidden = false;

    if (data.storageMode === "json") {
        notice.hidden = false;
        notice.textContent =
            "Local request mode: online requests are saved and manageable. Appointments and service changes require the database connection.";
    } else {
        notice.hidden = true;
        notice.textContent = "";
    }


    document.getElementById(
        "today"
    ).textContent =
        data.stats.today;


    document.getElementById(
        "pending"
    ).textContent =
        data.stats.pending;


    document.getElementById(
        "confirmed"
    ).textContent =
        data.stats.confirmed;


    document.getElementById(
        "customers"
    ).textContent =
        data.stats.customers;

    document.getElementById(
        "requestCount"
    ).textContent =
        data.stats.requests;

    const appointments = Array.isArray(data.appointments)
        ? data.appointments
        : [];
    const requests = Array.isArray(data.requests)
        ? data.requests
        : [];
    const services = Array.isArray(data.services)
        ? data.services
        : [];
    const databaseAvailable =
        data.storageMode !== "json";

    /*
    ==========================================
    APPOINTMENTS
    ==========================================
    */

    document.getElementById(
        "appointments"
    ).innerHTML =

        appointments.map(
            appointment => `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(
                            appointment.customer_name
                        )}
                    </strong>

                    <br>

                    ${escapeHTML(
                        appointment.phone
                    )}

                </td>


                <td>
                    ${escapeHTML(
                        appointment.service_name
                    )}
                </td>


                <td>
                    ${appointment.appointment_date}
                </td>


                <td>
                    ${appointment.appointment_time}
                </td>


                <td>

                    <span class="status">

                        ${appointment.status}

                    </span>

                </td>


                <td>

                    <select
                        onchange="
                        updateStatus(
                            ${appointment.id},
                            this.value
                        )"
                    >

                        ${
                            [
                                "pending",
                                "confirmed",
                                "completed",
                                "cancelled",
                                "no_show"
                            ]
                            .map(
                                status => `

                                <option
                                    ${
                                        status ===
                                        appointment.status
                                        ? "selected"
                                        : ""
                                    }
                                >

                                    ${status}

                                </option>

                                `
                            )
                            .join("")
                        }

                    </select>

                </td>

            </tr>

            `
        ).join("") ||
        `<tr><td colspan="6">No appointments to show.</td></tr>`;

    document.getElementById(
        "requests"
    ).innerHTML =
        requests.map(
            request => `
            <tr>
                <td>
                    <strong>${escapeHTML(request.customer_name)}</strong>
                    <br>
                    <a href="tel:${escapeHTML(request.phone)}">${escapeHTML(request.phone)}</a>
                </td>
                <td>${escapeHTML(request.request_details)}</td>
                <td>
                    ${escapeHTML(request.location)}
                    <br>
                    House: ${escapeHTML(request.house_number)}
                </td>
                <td>${new Date(request.created_at).toLocaleString()}</td>
                <td><span class="status">${escapeHTML(request.status)}</span></td>
                <td>
                    <select onchange="updateRequestStatus(${request.id}, this.value)">
                        ${
                            ["pending", "contacted", "completed", "cancelled"]
                                .map(status => `
                                    <option ${status === request.status ? "selected" : ""}>
                                        ${status}
                                    </option>
                                `)
                                .join("")
                        }
                    </select>
                </td>
            </tr>
            `
        ).join("") ||
        `<tr><td colspan="6">No online requests yet.</td></tr>`;


    /*
    ==========================================
    SERVICES
    ==========================================
    */

    document.getElementById(
        "services"
    ).innerHTML =

        services.map(
            service => `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(
                            service.name
                        )}
                    </strong>

                    <br>

                    ${escapeHTML(
                        service.description || ""
                    )}

                </td>


                <td>

                    KSh
                    ${Number(
                        service.price
                    ).toLocaleString("en-KE")}

                </td>


                <td>

                    ${service.duration_minutes}
                    min

                </td>


                <td>

                    ${
                        service.active
                        ? "Yes"
                        : "No"
                    }

                </td>


                <td>

                    <button
                        onclick="
                        toggleService(
                            ${service.id},
                            ${!service.active}
                        )"
                        ${databaseAvailable ? "" : "disabled"}
                    >

                        ${
                            service.active
                            ? "Deactivate"
                            : "Activate"
                        }

                    </button>

                </td>

            </tr>

            `
        ).join("") ||
        `<tr><td colspan="5">No services to show.</td></tr>`;

    document.querySelector(
        "#serviceForm button[type='submit']"
    ).disabled = !databaseAvailable;

}

async function updateRequestStatus(id, status) {
    try {
        await performAdminAction(
            `/api/admin/requests/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            }
        );
    } catch (error) {
        showDashboardNotice(error.message);
        console.error(error);
    }
}

async function performAdminAction(url, options) {
    const response = await fetch(url, {
        ...options,
        headers: adminHeaders(options.headers)
    });
    const result = await readResponse(response);

    if (!response.ok) {
        if (response.status === 401) {
            await loadDashboard();
        }

        throw new Error(result.error || "The requested change could not be saved.");
    }

    await loadDashboard();
}


/*
==========================================
CHANGE APPOINTMENT STATUS
==========================================
*/

async function updateStatus(
    id,
    status
) {
    try {
        await performAdminAction(
            `/api/admin/appointments/${encodeURIComponent(id)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            }
        );
    } catch (error) {
        showDashboardNotice(error.message);
        console.error(error);
    }
}


/*
==========================================
ACTIVATE / DEACTIVATE SERVICE
==========================================
*/

async function toggleService(
    id,
    active
) {
    try {
        await performAdminAction(
            `/api/admin/services/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ active })
            }
        );
    } catch (error) {
        showDashboardNotice(error.message);
        console.error(error);
    }
}


/*
==========================================
ADD SERVICE
==========================================
*/

document.getElementById(
    "serviceForm"
).addEventListener(
    "submit",
    async event => {

        event.preventDefault();
        const form = event.currentTarget;
        const submitButton = form.querySelector("button[type='submit']");
        const wasDisabled = submitButton.disabled;
        const message = document.getElementById("message");
        const data = Object.fromEntries(new FormData(form).entries());
        submitButton.disabled = true;

        try {
            await performAdminAction(
                "/api/admin/services",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );
            message.textContent = "Service added successfully.";
            form.reset();
        } catch (error) {
            message.textContent = error.message;
            showDashboardNotice(error.message);
            console.error(error);
        } finally {
            submitButton.disabled = wasDisabled;
        }
    }
);


/*
==========================================
HTML SECURITY
==========================================
*/

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,

            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]
        );

}


loadDashboard();