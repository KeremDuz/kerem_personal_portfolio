import { Router } from "express";
import { getAbout, upsertAbout } from "../controllers/aboutController";
import auth from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", getAbout);

// Admin routes
router.put("/admin", auth, upsertAbout);
router.post("/admin", auth, upsertAbout);

export default router;
