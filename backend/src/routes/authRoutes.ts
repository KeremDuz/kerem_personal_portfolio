import { Router } from "express";
import { login, getMe } from "../controllers/authController";
import auth from "../middleware/auth";
import validate from "../middleware/validate";
import { loginSchema } from "../middleware/schemas";

const router = Router();

// POST /api/auth/login
router.post("/login", validate(loginSchema), login);

// GET /api/auth/me (protected)
router.get("/me", auth, getMe);

export default router;
