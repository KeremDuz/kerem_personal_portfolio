import { Router } from "express";
import {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogsAdmin,
} from "../controllers/blogController";
import auth from "../middleware/auth";
import validate from "../middleware/validate";
import { createBlogSchema, updateBlogSchema } from "../middleware/schemas";
import publicCache from "../middleware/publicCache";

const router = Router();

// Public routes
router.get("/", publicCache(), getAllBlogs);
router.get("/:id", publicCache(), getBlogById);

// Admin routes (protected)
router.get("/admin/all", auth, getAllBlogsAdmin);
router.post("/admin", auth, validate(createBlogSchema), createBlog);
router.put("/admin/:id", auth, validate(updateBlogSchema), updateBlog);
router.delete("/admin/:id", auth, deleteBlog);

export default router;
