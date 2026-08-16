import { Router } from "express";
import {
    getAllTravels,
    getTravelById,
    createTravel,
    updateTravel,
    deleteTravel,
    getAllTravelsAdmin,
} from "../controllers/travelController";
import auth from "../middleware/auth";
import validate from "../middleware/validate";
import { createTravelSchema, updateTravelSchema } from "../middleware/schemas";
import publicCache from "../middleware/publicCache";

const router = Router();

// Public routes
router.get("/", publicCache(), getAllTravels);
router.get("/:id", publicCache(), getTravelById);

// Admin routes (protected)
router.get("/admin/all", auth, getAllTravelsAdmin);
router.post("/admin", auth, validate(createTravelSchema), createTravel);
router.put("/admin/:id", auth, validate(updateTravelSchema), updateTravel);
router.delete("/admin/:id", auth, deleteTravel);

export default router;
