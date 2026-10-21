import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

function secret(name: string): string {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set to a random value of at least 32 characters.`);
  }
  return value;
}

export function validateTokenSecrets(): void {
  secret("JWT_SECRET");
  secret("REFRESH_SECRET");
}

export function createAccessToken(userId: number): string {
  return jwt.sign({ userId, tokenType: "access" }, secret("JWT_SECRET"), {
    expiresIn: "15m",
    algorithm: "HS256",
  });
}

export function createRefreshToken(userId: number): { token: string; hash: string } {
  const token = jwt.sign(
    { userId, tokenType: "refresh", jti: randomUUID() },
    secret("REFRESH_SECRET"),
    { expiresIn: "7d", algorithm: "HS256" },
  );
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token: string): number {
  const decoded = jwt.verify(token, secret("JWT_SECRET"), {
    algorithms: ["HS256"],
  });
  if (
    typeof decoded === "string" ||
    decoded.tokenType !== "access" ||
    typeof decoded.userId !== "number"
  ) {
    throw new Error("Invalid access token.");
  }
  return decoded.userId;
}

export function verifyRefreshToken(token: string): number {
  const decoded = jwt.verify(token, secret("REFRESH_SECRET"), {
    algorithms: ["HS256"],
  });
  if (
    typeof decoded === "string" ||
    decoded.tokenType !== "refresh" ||
    typeof decoded.userId !== "number"
  ) {
    throw new Error("Invalid refresh token.");
  }
  return decoded.userId;
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" as const : "strict" as const,
    path: "/",
  };
}
