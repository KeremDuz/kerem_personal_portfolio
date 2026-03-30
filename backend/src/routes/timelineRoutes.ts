import { Router } from "express";
import {
    getAllTimelines,
    getAllAdmin,
    createTimeline,
    updateTimeline,
    deleteTimeline,
} from "../controllers/timelineController";
import auth from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", getAllTimelines);

// Admin routes (Protected via server.ts mount if needed, or explicitly here)
// Typically other routes just use auth. Let's add auth middleware here as well for admin routes
router.get("/admin/all", auth, getAllAdmin);
router.post("/admin", auth, createTimeline);
router.put("/admin/:id", auth, updateTimeline);
router.delete("/admin/:id", auth, deleteTimeline);

export default router;
