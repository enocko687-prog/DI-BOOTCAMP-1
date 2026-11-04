"use strict";

const express = require("express");
const { getPool, getSqlDriver } = require("../database");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateMessage(body) {
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!fullName || !email || !message || !emailPattern.test(email)) {
        return { error: "Please provide a name, valid email address, and message." };
    }

    if (
        fullName.length > 120 ||
        email.length > 255 ||
        subject.length > 200 ||
        message.length > 2000
    ) {
        return { error: "Please shorten one or more fields and try again." };
    }

    return { fullName, email, subject, message };
}

router.post("/", async (req, res) => {
    if (!req.is("application/json")) {
        return res.status(415).json({ message: "Send contact details as JSON." });
    }

    const values = validateMessage(req.body || {});
    if (values.error) {
        return res.status(400).json({ message: values.error });
    }

    try {
        const pool = await getPool();
        const sql = getSqlDriver();

        await pool.request()
            .input("FullName", sql.NVarChar(120), values.fullName)
            .input("Email", sql.NVarChar(255), values.email)
            .input("Subject", sql.NVarChar(200), values.subject)
            .input("Message", sql.NVarChar(2000), values.message)
            .query(`
                INSERT INTO ContactMessages (FullName, Email, Subject, Message)
                VALUES (@FullName, @Email, @Subject, @Message)
            `);

        return res.status(201).json({
            message: "Your message has been received. Thank you!"
        });
    } catch (error) {
        console.error("Unable to save contact message:", error.message);
        return res.status(503).json({
            message: "Your message could not be saved right now. Please email Enock directly."
        });
    }
});

module.exports = router;
module.exports.validateMessage = validateMessage;
