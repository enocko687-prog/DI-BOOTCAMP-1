import { Router, type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { getCurrentUser, login, logout, refresh, register, searchUsers } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

function validateCookieRequest(request: Request, response: Response, next: NextFunction): void {
  const origin = request.header("origin");
  const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
  if (origin && origin !== allowedOrigin) {
    response.status(403).json({ message: "Request origin is not allowed." });
    return;
  }
  next();
}

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", validateCookieRequest, refresh);
router.post("/logout", validateCookieRequest, logout);
router.get("/me", authenticate, getCurrentUser);
router.get("/users/search", authenticate, searchUsers);

export default router;
