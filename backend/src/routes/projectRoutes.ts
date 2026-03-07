import { Router } from "express";
import {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    getAllProjectsAdmin,
} from "../controllers/projectController";
import auth from "../middleware/auth";
import validate from "../middleware/validate";
import { createProjectSchema, updateProjectSchema } from "../middleware/schemas";

const router = Router();

// Public routes
router.get("/", getAllProjects);

// Admin routes (protected)
router.get("/admin/all", auth, getAllProjectsAdmin);
router.post("/admin", auth, validate(createProjectSchema), createProject);
router.put("/admin/:id", auth, validate(updateProjectSchema), updateProject);
router.delete("/admin/:id", auth, deleteProject);

export default router;
