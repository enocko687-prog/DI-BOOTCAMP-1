import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

try {
  const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
  const schema = await readFile(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database schema initialized.");
} catch (error) {
  console.error("Unable to initialize database schema:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
