"use strict";

const express = require("express");
const { getPool } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT SkillID, SkillName, Category, SkillLevel
            FROM Skills
            ORDER BY Category, SkillName
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Unable to load skills:", error.message);
        res.status(503).json({ message: "Skills are temporarily unavailable." });
    }
});

module.exports = router;
