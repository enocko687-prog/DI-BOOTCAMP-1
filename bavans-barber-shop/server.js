require("dotenv").config();

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;
const publicDir =
    path.join(__dirname, "data base", "public");
const requestStorePath = path.resolve(
    process.env.REQUESTS_JSON_PATH ||
        path.join(__dirname, "data", "customer-requests.json")
);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

let requestStoreQueue = Promise.resolve();

async function readRequestsFromJson() {
    try {
        const contents = await fs.readFile(requestStorePath, "utf8");
        const requests = JSON.parse(contents);

        if (!Array.isArray(requests)) {
            throw new Error("Customer request JSON must contain an array.");
        }

        return requests;
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

async function writeRequestsToJson(requests) {
    await fs.mkdir(path.dirname(requestStorePath), {
        recursive: true
    });

    const temporaryPath =
        `${requestStorePath}.${randomUUID()}.tmp`;

    await fs.writeFile(
        temporaryPath,
        JSON.stringify(requests, null, 2),
        {
            encoding: "utf8",
            flag: "wx"
        }
    );

    await fs.rename(temporaryPath, requestStorePath);
}

function enqueueRequestStore(operation) {
    const result = requestStoreQueue.then(operation);
    requestStoreQueue = result.catch(() => {});
    return result;
}

function saveRequestToJson(request) {
    return enqueueRequestStore(async () => {
        const requests = await readRequestsFromJson();
        const savedRequest = {
            id: randomUUID(),
            ...request,
            status: "pending",
            created_at: new Date().toISOString()
        };

        await writeRequestsToJson([...requests, savedRequest]);
        return savedRequest;
    });
}

function updateRequestInJson(id, status) {
    return enqueueRequestStore(async () => {
        const requests = await readRequestsFromJson();
        const requestIndex = requests.findIndex(
            request => String(request.id) === String(id)
        );

        if (requestIndex === -1) {
            return null;
        }

        const updatedRequest = {
            ...requests[requestIndex],
            status,
            updated_at: new Date().toISOString()
        };

        requests[requestIndex] = updatedRequest;
        await writeRequestsToJson(requests);

        return {
            id: updatedRequest.id,
            status: updatedRequest.status
        };
    });
}

const fallbackServices = [
    {
        id: 1,
        name: "Classic Haircut",
        description: "Clean and professional haircut.",
        price: 300,
        duration_minutes: 30
    },
    {
        id: 2,
        name: "Fade & Styling",
        description: "Sharp fade and modern styling.",
        price: 400,
        duration_minutes: 40
    },
    {
        id: 3,
        name: "Beard Grooming",
        description: "Beard trimming and shaping.",
        price: 200,
        duration_minutes: 25
    },
    {
        id: 4,
        name: "Hair & Beard Combo",
        description: "Complete haircut and beard grooming.",
        price: 500,
        duration_minutes: 55
    },
    {
        id: 5,
        name: "Kids Haircut",
        description: "Neat haircut for children.",
        price: 200,
        duration_minutes: 30
    }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(publicDir));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/admin", (req, res) => {
    res.redirect("/admin.html");
});

/*
==================================================
ADMIN AUTHENTICATION
==================================================
*/

function adminAuth(req, res, next) {

    const auth =
        req.headers.authorization || "";

    if (!auth.startsWith("Basic ")) {

        res.set(
            "WWW-Authenticate",
            'Basic realm="Teacher Bevan Admin"'
        );

        return res
            .status(401)
            .send("Admin login required.");
    }

    const decoded = Buffer
        .from(
            auth.split(" ")[1],
            "base64"
        )
        .toString("utf8");

    const separator =
        decoded.indexOf(":");

    const username =
        decoded.substring(
            0,
            separator
        );

    const password =
        decoded.substring(
            separator + 1
        );

    if (
        username !==
            process.env.ADMIN_USERNAME ||

        password !==
            process.env.ADMIN_PASSWORD
    ) {

        res.set(
            "WWW-Authenticate",
            'Basic realm="Teacher Bevan Admin"'
        );

        return res
            .status(401)
            .send("Invalid credentials.");
    }

    next();
}


/*
==================================================
GET SERVICES
==================================================
*/

app.get(
    "/api/services",
    async (req, res) => {

        try {

            const result =
                await pool.query(`
                    SELECT
                        id,
                        name,
                        description,
                        price,
                        duration_minutes

                    FROM services

                    WHERE active = TRUE

                    ORDER BY
                        sort_order,
                        id
                `);

            if (result.rows.length > 0) {
                return res.json(result.rows);
            }

            return res.json(fallbackServices);

        } catch (error) {

            console.error(error);

            return res.json(fallbackServices);
        }
    }
);


/*
==================================================
CREATE BOOKING
==================================================
*/

app.post(
    "/api/bookings",
    async (req, res) => {

        const {
            customer_name,
            phone,
            service_id,
            appointment_date,
            appointment_time,
            notes
        } = req.body;

        if (
            !customer_name ||
            !phone ||
            !service_id ||
            !appointment_date ||
            !appointment_time
        ) {

            return res.status(400).json({
                error:
                    "Please complete all required fields."
            });
        }

        try {

            const conflict =
                await pool.query(
                    `
                    SELECT id

                    FROM appointments

                    WHERE appointment_date = $1

                    AND appointment_time = $2

                    AND status IN
                    ('pending', 'confirmed')
                    `,
                    [
                        appointment_date,
                        appointment_time
                    ]
                );

            if (conflict.rows.length > 0) {

                return res.status(409).json({
                    error:
                        "That time is already booked."
                });
            }


            /*
            Create/update customer
            */

            const customer =
                await pool.query(
                    `
                    INSERT INTO customers
                    (name, phone)

                    VALUES
                    ($1, $2)

                    ON CONFLICT (phone)

                    DO UPDATE SET
                        name =
                        EXCLUDED.name

                    RETURNING id
                    `,
                    [
                        customer_name,
                        phone
                    ]
                );

            const customerId =
                customer.rows[0].id;


            /*
            Create appointment
            */

            const appointment =
                await pool.query(
                    `
                    INSERT INTO appointments
                    (
                        customer_id,
                        service_id,
                        appointment_date,
                        appointment_time,
                        notes
                    )

                    VALUES
                    ($1, $2, $3, $4, $5)

                    RETURNING
                        id,
                        appointment_date,
                        appointment_time,
                        status
                    `,
                    [
                        customerId,
                        service_id,
                        appointment_date,
                        appointment_time,
                        notes || null
                    ]
                );


            res.status(201).json({

                message:
                    "Booking received successfully.",

                booking:
                    appointment.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Unable to save booking."

            });
        }
    }
);

/*
==================================================
CREATE CUSTOMER REQUEST
==================================================
*/

app.post(
    "/api/requests",
    async (req, res) => {
        const body =
            req.body && typeof req.body === "object"
                ? req.body
                : {};
        const customerName =
            typeof body.customer_name === "string"
                ? body.customer_name.trim()
                : "";
        const phone =
            typeof body.phone === "string"
                ? body.phone.trim()
                : "";
        const requestDetails =
            typeof body.request_details === "string"
                ? body.request_details.trim()
                : "";
        const location =
            typeof body.location === "string"
                ? body.location.trim()
                : "";
        const houseNumber =
            typeof body.house_number === "string"
                ? body.house_number.trim()
                : "";

        if (
            customerName.length < 2 ||
            customerName.length > 120 ||
            phone.length < 7 ||
            phone.length > 30 ||
            requestDetails.length < 5 ||
            requestDetails.length > 2000 ||
            location.length < 2 ||
            location.length > 200 ||
            houseNumber.length < 1 ||
            houseNumber.length > 80
        ) {
            return res.status(400).json({
                error: "Please enter valid contact details, request, location and house number."
            });
        }

        try {
            const result = await pool.query(
                `
                INSERT INTO customer_requests
                (
                    customer_name,
                    phone,
                    request_details,
                    location,
                    house_number
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, status, created_at
                `,
                [
                    customerName,
                    phone,
                    requestDetails,
                    location,
                    houseNumber
                ]
            );

            return res.status(201).json({
                message: "Your request has been sent. We will contact you shortly.",
                request: result.rows[0]
            });
        } catch (error) {
            console.error(
                "Database unavailable for customer request; saving request as JSON.",
                error
            );

            try {
                const savedRequest = await saveRequestToJson({
                    customer_name: customerName,
                    phone,
                    request_details: requestDetails,
                    location,
                    house_number: houseNumber
                });

                return res.status(201).json({
                    message: "Your request has been received and recorded. We will contact you shortly.",
                    request: {
                        id: savedRequest.id,
                        status: savedRequest.status,
                        created_at: savedRequest.created_at
                    }
                });
            } catch (storageError) {
                console.error(
                    "Unable to save customer request to JSON.",
                    storageError
                );

                return res.status(503).json({
                    error: "We could not record your request. Please try again later."
                });
            }
        }
    }
);


/*
==================================================
ADMIN DASHBOARD
==================================================
*/

app.get(
    "/api/admin/dashboard",
    adminAuth,
    async (req, res) => {

        try {

            const stats =
                await pool.query(`
                    SELECT

                    (
                        SELECT COUNT(*)
                        FROM appointments
                        WHERE appointment_date =
                        CURRENT_DATE
                    ) AS today,

                    (
                        SELECT COUNT(*)
                        FROM appointments
                        WHERE status = 'pending'
                    ) AS pending,

                    (
                        SELECT COUNT(*)
                        FROM appointments
                        WHERE status = 'confirmed'
                    ) AS confirmed,

                    (
                        SELECT COUNT(*)
                        FROM customers
                    ) AS customers
                `);


            const appointments =
                await pool.query(`
                    SELECT

                    a.id,

                    c.name AS customer_name,

                    c.phone,

                    s.name AS service_name,

                    s.price,

                    a.appointment_date,

                    a.appointment_time,

                    a.status,

                    a.notes

                    FROM appointments a

                    JOIN customers c
                    ON c.id = a.customer_id

                    JOIN services s
                    ON s.id = a.service_id

                    ORDER BY
                        a.appointment_date DESC,
                        a.appointment_time DESC

                    LIMIT 100
                `);


            const services =
                await pool.query(`
                    SELECT
                        id,
                        name,
                        description,
                        price,
                        duration_minutes,
                        active

                    FROM services

                    ORDER BY
                        sort_order,
                        id
                `);

            const requests =
                await pool.query(`
                        SELECT
                            id,
                            customer_name,
                            phone,
                            request_details,
                            location,
                            house_number,
                            status,
                            created_at
                        FROM customer_requests
                        ORDER BY created_at DESC
                        LIMIT 100
                `);

            const localRequests =
                await readRequestsFromJson();
            const allRequests = [
                ...requests.rows,
                ...localRequests
            ]
                .sort(
                    (left, right) =>
                        new Date(right.created_at) -
                        new Date(left.created_at)
                )
                .slice(0, 100);

            return res.json({

                stats:
                    {
                        ...stats.rows[0],
                        requests: allRequests.length
                    },

                appointments:
                    appointments.rows,

                services:
                    services.rows,

                requests:
                    allRequests,

                storageMode:
                    "database"

            });

        } catch (error) {

            console.error(
                "Database unavailable; loading admin dashboard from local request storage.",
                error
            );

            try {
                const requests =
                    await readRequestsFromJson();

                return res.json({
                    stats: {
                        today: 0,
                        pending: 0,
                        confirmed: 0,
                        customers: 0,
                        requests: requests.length
                    },
                    appointments: [],
                    services: fallbackServices.map(
                        service => ({
                            ...service,
                            active: true
                        })
                    ),
                    requests: requests
                        .sort(
                            (left, right) =>
                                new Date(right.created_at) -
                                new Date(left.created_at)
                        )
                        .slice(0, 100),
                    storageMode: "json"
                });
            } catch (storageError) {
                console.error(
                    "Unable to load local request storage for admin dashboard.",
                    storageError
                );

                return res.status(503).json({
                    error: "Unable to load dashboard data from the database or local request storage."
                });
            }
        }
    }
);

/*
==================================================
UPDATE CUSTOMER REQUEST STATUS
==================================================
*/

app.patch(
    "/api/admin/requests/:id/status",
    adminAuth,
    async (req, res) => {
        const allowed = [
            "pending",
            "contacted",
            "completed",
            "cancelled"
        ];
        const status = req.body.status;

        if (!allowed.includes(status)) {
            return res.status(400).json({
                error: "Invalid request status."
            });
        }

        try {
            if (!/^\d+$/.test(String(req.params.id))) {
                const localRequest = await updateRequestInJson(
                    req.params.id,
                    status
                );

                if (!localRequest) {
                    return res.status(404).json({
                        error: "Customer request not found."
                    });
                }

                return res.json(localRequest);
            }

            const result = await pool.query(
                `
                UPDATE customer_requests
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING id, status
                `,
                [status, req.params.id]
            );

            if (result.rows.length === 0) {
                const localRequest = await updateRequestInJson(
                    req.params.id,
                    status
                );

                if (localRequest) {
                    return res.json(localRequest);
                }

                return res.status(404).json({
                    error: "Customer request not found."
                });
            }

            return res.json(result.rows[0]);
        } catch (error) {
            console.error(
                "Database unavailable; updating request in local JSON storage.",
                error
            );

            try {
                const localRequest = await updateRequestInJson(
                    req.params.id,
                    status
                );

                if (!localRequest) {
                    return res.status(404).json({
                        error: "Customer request not found."
                    });
                }

                return res.json(localRequest);
            } catch (storageError) {
                console.error(
                    "Unable to update customer request in local JSON storage.",
                    storageError
                );

                return res.status(500).json({
                    error: "Unable to update the customer request."
                });
            }
        }
    }
);


/*
==================================================
UPDATE APPOINTMENT STATUS
==================================================
*/

app.patch(
    "/api/admin/appointments/:id/status",
    adminAuth,
    async (req, res) => {

        const {
            status
        } = req.body;

        const allowed = [
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "no_show"
        ];

        if (
            !allowed.includes(status)
        ) {

            return res.status(400).json({
                error:
                    "Invalid status."
            });
        }

        try {

            const result =
                await pool.query(
                    `
                    UPDATE appointments

                    SET
                        status = $1,
                        updated_at = NOW()

                    WHERE id = $2

                    RETURNING
                        id,
                        status
                    `,
                    [
                        status,
                        req.params.id
                    ]
                );

            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Appointment not found."
                });
            }

            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to update appointment."
            });
        }
    }
);


/*
==================================================
ADD SERVICE
==================================================
*/

app.post(
    "/api/admin/services",
    adminAuth,
    async (req, res) => {

        const {
            name,
            description,
            price,
            duration_minutes
        } = req.body;

        if (
            !name ||
            price === undefined ||
            !duration_minutes
        ) {

            return res.status(400).json({
                error:
                    "Name, price and duration are required."
            });
        }

        try {

            const result =
                await pool.query(
                    `
                    INSERT INTO services
                    (
                        name,
                        description,
                        price,
                        duration_minutes
                    )

                    VALUES
                    ($1, $2, $3, $4)

                    RETURNING *
                    `,
                    [
                        name,
                        description || "",
                        Number(price),
                        Number(duration_minutes)
                    ]
                );

            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to create service."
            });
        }
    }
);


/*
==================================================
ACTIVATE / DEACTIVATE SERVICE
==================================================
*/

app.patch(
    "/api/admin/services/:id",
    adminAuth,
    async (req, res) => {

        const {
            active
        } = req.body;

        try {

            const result =
                await pool.query(
                    `
                    UPDATE services

                    SET active = $1

                    WHERE id = $2

                    RETURNING *
                    `,
                    [
                        Boolean(active),
                        req.params.id
                    ]
                );

            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Unable to update service."
            });
        }
    }
);


/*
==================================================
DATABASE HEALTH CHECK
==================================================
*/

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await pool.query(
                "SELECT 1"
            );

            res.json({
                status: "ok",
                database: "connected"
            });

        } catch {

            res.status(503).json({
                status: "error",
                database: "disconnected"
            });
        }
    }
);


/*
==================================================
START SERVER
==================================================
*/

app.listen(
    PORT,
    () => {

        console.log(
            `Teacher Bevan's Barber Shop running at http://localhost:${PORT}`
        );

    }
);