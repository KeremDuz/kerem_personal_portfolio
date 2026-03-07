import { Router } from "express";
import { uploadFile, deleteFile, upload } from "../controllers/uploadController";
import auth from "../middleware/auth";

const router = Router();

// All upload routes are admin-only
router.post("/", auth, upload.single("file"), uploadFile);
router.delete("/:publicId(*)", auth, deleteFile);

export default router;
