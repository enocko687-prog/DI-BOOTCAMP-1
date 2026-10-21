import "dotenv/config";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { pool } from "./db/pool.js";
import authRoutes from "./routes/authRoutes.js";
import contributorRoutes from "./routes/contributorRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import { validateTokenSecrets } from "./helpers/tokens.js";
import { verifyAccessToken } from "./helpers/tokens.js";
import { canEditStory } from "./models/storyModel.js";
import { advancedRoutes } from "./routes/advancedRoutes.js";

const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: frontendUrl, credentials: true },
});

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/contributors", contributorRoutes);
app.use("/api", advancedRoutes);
app.use(authRoutes);
app.use("/stories", storyRoutes);
app.use("/contributors", contributorRoutes);
app.use("/", advancedRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (typeof token !== "string") {
    next(new Error("Authentication required."));
    return;
  }
  try {
    socket.data.userId = verifyAccessToken(token);
    next();
  } catch {
    next(new Error("Invalid or expired access token."));
  }
});

io.on("connection", (socket) => {
  socket.on("story:join", async (storyId: number) => {
    if (!Number.isSafeInteger(storyId) || storyId < 1) return;
    if (!(await canEditStory(storyId, socket.data.userId))) return;
    await socket.join(`story:${storyId}`);
    socket.emit("story:joined", { storyId });
  });
  socket.on("story:cursor", async (payload: { storyId: number; position: number }) => {
    if (!Number.isSafeInteger(payload?.storyId) || !Number.isSafeInteger(payload?.position)) return;
    if (!(await canEditStory(payload.storyId, socket.data.userId))) return;
    socket.to(`story:${payload.storyId}`).emit("story:cursor", {
      userId: socket.data.userId,
      position: Math.max(0, Math.min(payload.position, 100000)),
    });
  });
});
app.set("io", io);

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ message: "Request body must contain valid JSON." });
    return;
  }
  const pgError = error as { code?: string };
  if (pgError.code === "23505") {
    response.status(409).json({ message: "That record already exists." });
    return;
  }
  console.error("Unexpected API error:", error);
  response.status(500).json({ message: "An unexpected server error occurred." });
});

async function start(): Promise<void> {
  validateTokenSecrets();
  await pool.query("SELECT 1");
  server.listen(port, () => {
    console.log(`Story API listening on http://localhost:${port}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  start().catch(async (error: unknown) => {
    console.error("Unable to start API. Check DATABASE_URL and database availability.", error);
    await pool.end();
    process.exitCode = 1;
  });
}

export default app;
