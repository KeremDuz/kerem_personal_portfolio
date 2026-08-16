import { Router } from "express";
import { trackVisitorEvent } from "../controllers/trackController";
import validate from "../middleware/validate";
import { trackEventSchema } from "../middleware/schemas";

const router = Router();

// Public route for frontend to send analytics
router.post("/", validate(trackEventSchema), trackVisitorEvent);

export default router;
