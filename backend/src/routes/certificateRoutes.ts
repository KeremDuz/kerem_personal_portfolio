import { Router } from "express";
import {
    getAllCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getAllCertificatesAdmin,
} from "../controllers/certificateController";
import auth from "../middleware/auth";
import validate from "../middleware/validate";
import { createCertificateSchema, updateCertificateSchema } from "../middleware/schemas";

const router = Router();

// Public routes
router.get("/", getAllCertificates);

// Admin routes (protected)
router.get("/admin/all", auth, getAllCertificatesAdmin);
router.post("/admin", auth, validate(createCertificateSchema), createCertificate);
router.put("/admin/:id", auth, validate(updateCertificateSchema), updateCertificate);
router.delete("/admin/:id", auth, deleteCertificate);

export default router;
