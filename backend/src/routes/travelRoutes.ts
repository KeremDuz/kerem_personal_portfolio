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

const router = Router();

// Public routes
router.get("/", getAllTravels);
router.get("/:id", getTravelById);

// Admin routes (protected)
router.get("/admin/all", auth, getAllTravelsAdmin);
router.post("/admin", auth, validate(createTravelSchema), createTravel);
router.put("/admin/:id", auth, validate(updateTravelSchema), updateTravel);
router.delete("/admin/:id", auth, deleteTravel);

export default router;
