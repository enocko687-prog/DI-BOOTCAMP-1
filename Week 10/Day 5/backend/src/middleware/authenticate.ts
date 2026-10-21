import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../helpers/tokens.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authorization = request.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    request.userId = verifyAccessToken(match[1]);
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired access token." });
  }
}
