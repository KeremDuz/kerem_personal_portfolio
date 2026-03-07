import { Request, Response } from "express";
import Blog from "../models/Blog";

// GET /api/blogs — Public
export const getAllBlogs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await Blog.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error("Blog getAll error:", error);
        res.status(500).json({ error: "Blog yazıları yüklenirken hata oluştu." });
    }
};

// GET /api/blogs/:id — Public
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            res.status(404).json({ error: "Blog yazısı bulunamadı." });
            return;
        }
        res.json(blog);
    } catch (error) {
        console.error("Blog getById error:", error);
        res.status(500).json({ error: "Sunucu hatası." });
    }
};

// POST /api/admin/blogs — Admin
export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error("Blog create error:", error);
        res.status(400).json({ error: "Blog yazısı oluşturulurken hata oluştu." });
    }
};

// PUT /api/admin/blogs/:id — Admin
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!blog) {
            res.status(404).json({ error: "Blog yazısı bulunamadı." });
            return;
        }
        res.json(blog);
    } catch (error) {
        console.error("Blog update error:", error);
        res.status(400).json({ error: "Güncelleme sırasında hata oluştu." });
    }
};

// DELETE /api/admin/blogs/:id — Admin
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            res.status(404).json({ error: "Blog yazısı bulunamadı." });
            return;
        }
        res.json({ message: "Blog yazısı silindi." });
    } catch (error) {
        console.error("Blog delete error:", error);
        res.status(500).json({ error: "Silme sırasında hata oluştu." });
    }
};

// GET /api/admin/blogs — Admin: Get ALL
export const getAllBlogsAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        console.error("Blog getAllAdmin error:", error);
        res.status(500).json({ error: "Blog yazıları yüklenirken hata oluştu." });
    }
};
