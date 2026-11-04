"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { getPool, closePool } = require("./database");

const app = express();
const port = Number.parseInt(process.env.PORT || "5000", 10);
const projectRoot = path.resolve(__dirname, "..");
const frontendDirectory = path.join(projectRoot, "frontend");
const allowedOrigins = new Set([
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    ...(process.env.CORS_ORIGIN || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
]);

app.disable("x-powered-by");
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            formAction: ["'self'", "mailto:"],
            imgSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            upgradeInsecureRequests: null
        }
    }
}));
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error("This origin is not allowed."));
    }
}));
app.use(express.json({ limit: "20kb", strict: true }));
app.use(express.static(frontendDirectory, {
    dotfiles: "ignore",
    extensions: ["html"],
    maxAge: "1h"
}));
app.use("/assets", express.static(path.join(projectRoot, "assets"), {
    dotfiles: "ignore",
    maxAge: "7d"
}));
app.get("/enock-brighton-cv.txt", (req, res) => {
    res.sendFile(path.join(projectRoot, "enock-brighton-cv.txt"));
});

app.get("/api/health", async (req, res) => {
    try {
        await getPool();
        return res.json({ status: "Online", database: "Connected" });
    } catch (error) {
        console.error("Database health check failed:", error.message);
        return res.status(503).json({ status: "Offline", database: "Disconnected" });
    }
});

app.use("/api/projects", require("./routes/projects"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/experience", require("./routes/experience"));
app.use("/api/contact", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many messages. Please try again later." }
}), require("./routes/contact"));

app.use("/api", (req, res) => {
    res.status(404).json({ message: "API endpoint not found." });
});

app.get("*", (req, res, next) => {
    if (path.extname(req.path)) {
        return next();
    }

    return res.sendFile(path.join(frontendDirectory, "index.html"));
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("Request failed:", error.message);
    return res.status(500).json({ message: "The request could not be completed." });
});

if (require.main === module) {
    const server = app.listen(port, () => {
        console.info(`Portfolio server listening at http://localhost:${port}`);
    });

    async function shutdown() {
        server.close(async () => {
            try {
                await closePool();
                process.exit(0);
            } catch (error) {
                console.error("Failed to close SQL Server connection:", error.message);
                process.exit(1);
            }
        });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

module.exports = app;
