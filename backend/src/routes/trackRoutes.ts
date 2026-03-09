import { Router } from "express";
import { trackVisitorEvent } from "../controllers/trackController";

const router = Router();

// Public route for frontend to send analytics
router.post("/", trackVisitorEvent);

export default router;
