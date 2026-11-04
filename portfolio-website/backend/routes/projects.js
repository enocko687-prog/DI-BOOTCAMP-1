"use strict";

const express = require("express");
const { getPool } = require("../database");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT ProjectID, ProjectName, Description, Technologies,
                   ImageURL, ProjectURL, GitHubURL
            FROM Projects
            ORDER BY CreatedAt DESC, ProjectID DESC
        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Unable to load projects:", error.message);
        res.status(503).json({ message: "Projects are temporarily unavailable." });
    }
});

module.exports = router;
