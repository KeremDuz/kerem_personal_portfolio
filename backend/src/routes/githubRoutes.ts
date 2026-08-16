import { Router } from "express";
import { getContributions } from "../controllers/githubController";

const router = Router();

// Public route
router.get("/contributions", getContributions);

export default router;
