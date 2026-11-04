"use strict";

const express = require("express");
const { getPool } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT ExperienceID, Position, Organization, Description,
                   StartDate, EndDate, IsCurrent
            FROM Experience
            ORDER BY IsCurrent DESC, StartDate DESC, ExperienceID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Unable to load experience:", error.message);
        res.status(503).json({ message: "Experience is temporarily unavailable." });
    }
});

module.exports = router;
