import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import jwt, { type JwtPayload } from "jsonwebtoken";

type User = {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
};

type PublicUser = Pick<User, "id" | "username" | "displayName">;
type TokenPayload = Omit<JwtPayload, "sub"> & {
  sub: string;
  tokenUse: "access" | "refresh";
};

declare global {
  namespace Express {
    interface Request {
      authUser?: PublicUser;
    }
  }
}

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const isProduction = process.env.NODE_ENV === "production";

const usersById = new Map<string, User>();
const userIdsByUsername = new Map<string, string>();
const refreshSessions = new Map<string, string>();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many refresh attempts. Please try again later." },
});

function requiredSecret(name: string): string {
  const secret = process.env[name];
  if (!secret || secret.length < 32) {
    throw new Error(`${name} must be set to a value of at least 32 characters.`);
  }
  return secret;
}

function publicUser(user: User): PublicUser {
  const { id, username, displayName } = user;
  return { id, username, displayName };
}

function setAuthCookies(
  response: Response,
  user: User,
  refreshId: string,
): void {
  const accessToken = jwt.sign(
    { tokenUse: "access" },
    requiredSecret("JWT_ACCESS_SECRET"),
    { subject: user.id, expiresIn: "15m", algorithm: "HS256" },
  );
  const refreshToken = jwt.sign(
    { tokenUse: "refresh", jti: refreshId },
    requiredSecret("JWT_REFRESH_SECRET"),
    { subject: user.id, expiresIn: "7d", algorithm: "HS256" },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
  };

  response.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  response.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  refreshSessions.set(refreshId, user.id);
}

function clearAuthCookies(response: Response): void {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
  };
  response.clearCookie(ACCESS_COOKIE, cookieOptions);
  response.clearCookie(REFRESH_COOKIE, cookieOptions);
}

function verifyToken(
  token: string,
  secretName: string,
  expectedUse: TokenPayload["tokenUse"],
): TokenPayload {
  const payload = jwt.verify(token, requiredSecret(secretName), {
    algorithms: ["HS256"],
  });

  if (
    typeof payload === "string" ||
    payload.tokenUse !== expectedUse ||
    typeof payload.sub !== "string"
  ) {
    throw new Error("Invalid token.");
  }

  return payload as TokenPayload;
}

function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const token = request.cookies?.[ACCESS_COOKIE];
  if (!token) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = verifyToken(token, "JWT_ACCESS_SECRET", "access");
    const user = usersById.get(payload.sub as string);
    if (!user) {
      clearAuthCookies(response);
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    request.authUser = publicUser(user);
    next();
  } catch {
    clearAuthCookies(response);
    response.status(401).json({ message: "Invalid or expired access token." });
  }
}

app.post("/api/auth/register", loginLimiter, async (request, response, next) => {
  try {
    const { username, password } = request.body ?? {};
    if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      response.status(400).json({
        message: "Username must be 3-30 characters: letters, numbers, or underscores.",
      });
      return;
    }
    if (
      typeof password !== "string" ||
      Buffer.byteLength(password, "utf8") < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      response.status(400).json({
        message: "Password must be at least 12 characters and no more than 72 bytes.",
      });
      return;
    }

    const normalizedUsername = username.toLowerCase();
    if (userIdsByUsername.has(normalizedUsername)) {
      response.status(409).json({ message: "Username is already registered." });
      return;
    }

    const user: User = {
      id: randomUUID(),
      username,
      displayName: username,
      passwordHash: await bcrypt.hash(password, 12),
    };
    usersById.set(user.id, user);
    userIdsByUsername.set(normalizedUsername, user.id);

    const refreshId = randomUUID();
    setAuthCookies(response, user, refreshId);
    response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", loginLimiter, async (request, response, next) => {
  try {
    const { username, password } = request.body ?? {};
    if (typeof username !== "string" || typeof password !== "string") {
      response.status(400).json({ message: "Username and password are required." });
      return;
    }

    const userId = userIdsByUsername.get(username.toLowerCase());
    const user = userId ? usersById.get(userId) : undefined;
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      response.status(401).json({ message: "Invalid username or password." });
      return;
    }

    const refreshId = randomUUID();
    setAuthCookies(response, user, refreshId);
    response.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/refresh", refreshLimiter, (request, response) => {
  const token = request.cookies?.[REFRESH_COOKIE];
  if (!token) {
    response.status(401).json({ message: "Refresh token required." });
    return;
  }

  try {
    const payload = verifyToken(token, "JWT_REFRESH_SECRET", "refresh");
    if (typeof payload.jti !== "string" || refreshSessions.get(payload.jti) !== payload.sub) {
      clearAuthCookies(response);
      response.status(401).json({ message: "Refresh token has expired or been revoked." });
      return;
    }

    const user = usersById.get(payload.sub);
    if (!user) {
      refreshSessions.delete(payload.jti);
      clearAuthCookies(response);
      response.status(401).json({ message: "Refresh token has expired or been revoked." });
      return;
    }

    refreshSessions.delete(payload.jti);
    setAuthCookies(response, user, randomUUID());
    response.json({ user: publicUser(user) });
  } catch {
    clearAuthCookies(response);
    response.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

app.post("/api/auth/logout", (request, response) => {
  const token = request.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyToken(token, "JWT_REFRESH_SECRET", "refresh");
      if (typeof payload.jti === "string") {
        refreshSessions.delete(payload.jti);
      }
    } catch {
      // An invalid or expired token still gets cleared from the browser.
    }
  }

  clearAuthCookies(response);
  response.status(204).end();
});

app.get("/api/auth/me", requireAuth, (request, response) => {
  response.json({ user: request.authUser });
});

app.patch("/api/users/me", requireAuth, (request, response) => {
  const { displayName } = request.body ?? {};
  if (
    typeof displayName !== "string" ||
    displayName.trim().length < 1 ||
    displayName.trim().length > 60
  ) {
    response.status(400).json({ message: "Display name must be 1-60 characters." });
    return;
  }

  const user = usersById.get(request.authUser!.id);
  if (!user) {
    response.status(404).json({ message: "User not found." });
    return;
  }

  user.displayName = displayName.trim();
  request.authUser = publicUser(user);
  response.json({ user: request.authUser });
});

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

  console.error("Unexpected server error:", error);
  response.status(500).json({ message: "Internal server error." });
});

if (require.main === module) {
  try {
    requiredSecret("JWT_ACCESS_SECRET");
    requiredSecret("JWT_REFRESH_SECRET");
    app.listen(PORT, () => {
      console.log(`JWT auth API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

export default app;
