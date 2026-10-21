import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import {
  consumeRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  revokeRefreshToken,
  saveRefreshToken,
} from "../models/authModel.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshCookieOptions,
  verifyRefreshToken,
} from "../helpers/tokens.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validPassword(password: unknown): password is string {
  return typeof password === "string" &&
    Buffer.byteLength(password, "utf8") >= 10 &&
    Buffer.byteLength(password, "utf8") <= 72;
}

function setRefreshCookie(response: Response, token: string): void {
  response.cookie("refreshToken", token, {
    ...refreshCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = request.body ?? {};
    if (
      typeof username !== "string" ||
      username.trim().length < 2 ||
      username.trim().length > 50 ||
      typeof email !== "string" ||
      email.length > 100 ||
      !emailPattern.test(email) ||
      !validPassword(password)
    ) {
      response.status(400).json({
        message: "Provide a username (2-50 characters), valid email, and password (10-72 bytes).",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      response.status(409).json({ message: "An account with that email already exists." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username.trim(), normalizedEmail, passwordHash);
    const refresh = createRefreshToken(user.id);
    await saveRefreshToken(user.id, refresh.hash, new Date(Date.now() + 7 * 86400000));
    setRefreshCookie(response, refresh.token);
    response.status(201).json({
      accessToken: createAccessToken(user.id),
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = request.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      response.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      response.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const refresh = createRefreshToken(user.id);
    await saveRefreshToken(user.id, refresh.hash, new Date(Date.now() + 7 * 86400000));
    setRefreshCookie(response, refresh.token);
    response.json({
      accessToken: createAccessToken(user.id),
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(request: Request, response: Response, next: NextFunction): Promise<void> {
  const token = request.cookies?.refreshToken;
  if (typeof token !== "string") {
    response.status(401).json({ message: "Refresh token required." });
    return;
  }

  let tokenUserId: number;
  try {
    tokenUserId = verifyRefreshToken(token);
  } catch {
    response.clearCookie("refreshToken", refreshCookieOptions());
    response.status(401).json({ message: "Refresh token is invalid or expired." });
    return;
  }

  try {
    const userId = await consumeRefreshToken(hashRefreshToken(token));
    if (!userId || userId !== tokenUserId) {
      response.clearCookie("refreshToken", refreshCookieOptions());
      response.status(401).json({ message: "Refresh token is invalid or expired." });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      response.clearCookie("refreshToken", refreshCookieOptions());
      response.status(401).json({ message: "Refresh token is invalid or expired." });
      return;
    }

    const replacement = createRefreshToken(userId);
    await saveRefreshToken(userId, replacement.hash, new Date(Date.now() + 7 * 86400000));
    setRefreshCookie(response, replacement.token);
    response.json({ accessToken: createAccessToken(userId), user });
  } catch (error) {
    next(error);
  }
}

export async function logout(request: Request, response: Response): Promise<void> {
  const token = request.cookies?.refreshToken;
  if (typeof token === "string") {
    await revokeRefreshToken(hashRefreshToken(token));
  }
  response.clearCookie("refreshToken", refreshCookieOptions());
  response.status(204).end();
}

export async function getCurrentUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const user = request.userId ? await findUserById(request.userId) : undefined;
    if (!user) {
      response.status(404).json({ message: "User not found." });
      return;
    }
    response.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const email = request.query.email;
    if (typeof email !== "string" || !emailPattern.test(email) || email.length > 100) {
      response.status(400).json({ message: "Provide a valid email address to search." });
      return;
    }
    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      response.status(404).json({ message: "No account found with that email." });
      return;
    }
    response.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    next(error);
  }
}
