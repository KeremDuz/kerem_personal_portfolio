import { Request, Response } from "express";
import Project from "../models/Project";

// GET /api/projects — Public
export const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
    try {
        const projects = await Project.find({ isActive: true }).sort({ order: 1 });
        res.json(projects);
    } catch (error) {
        console.error("Project getAll error:", error);
        res.status(500).json({ error: "Projeler yüklenirken hata oluştu." });
    }
};

// POST /api/admin/projects — Admin
export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error("Project create error:", error);
        res.status(400).json({ error: "Proje oluşturulurken hata oluştu." });
    }
};

// PUT /api/admin/projects/:id — Admin
export const updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!project) {
            res.status(404).json({ error: "Proje bulunamadı." });
            return;
        }
        res.json(project);
    } catch (error) {
        console.error("Project update error:", error);
        res.status(400).json({ error: "Güncelleme sırasında hata oluştu." });
    }
};

// DELETE /api/admin/projects/:id — Admin
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            res.status(404).json({ error: "Proje bulunamadı." });
            return;
        }
        res.json({ message: "Proje silindi." });
    } catch (error) {
        console.error("Project delete error:", error);
        res.status(500).json({ error: "Silme sırasında hata oluştu." });
    }
};

// GET /api/admin/projects — Admin: Get ALL
export const getAllProjectsAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const projects = await Project.find().sort({ order: 1 });
        res.json(projects);
    } catch (error) {
        console.error("Project getAllAdmin error:", error);
        res.status(500).json({ error: "Projeler yüklenirken hata oluştu." });
    }
};
