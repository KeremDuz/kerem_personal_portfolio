import { Router } from "express";
import { getAbout, upsertAbout } from "../controllers/aboutController";
import auth from "../middleware/auth";
import publicCache from "../middleware/publicCache";
import validate from "../middleware/validate";
import { aboutSchema } from "../middleware/schemas";

const router = Router();

// Public routes
router.get("/", publicCache(), getAbout);

// Admin routes
router.put("/admin", auth, validate(aboutSchema), upsertAbout);
router.post("/admin", auth, validate(aboutSchema), upsertAbout);

export default router;
