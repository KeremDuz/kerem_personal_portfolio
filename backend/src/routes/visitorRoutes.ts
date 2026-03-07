import { Router } from "express";
import {
    getVisitors,
    getVisitorStats,
    clearOldVisitors,
} from "../controllers/visitorController";
import auth from "../middleware/auth";

const router = Router();

// All visitor routes are admin-only
router.get("/", auth, getVisitors);
router.get("/stats", auth, getVisitorStats);
router.delete("/clear", auth, clearOldVisitors);

export default router;
