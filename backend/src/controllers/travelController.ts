import { Request, Response } from "express";
import Travel from "../models/Travel";

// GET /api/travel — Public: Get all active travel pins
export const getAllTravels = async (_req: Request, res: Response): Promise<void> => {
    try {
        const travels = await Travel.find({ isActive: true }).sort({ order: 1 });
        res.json(travels);
    } catch (error) {
        console.error("Travel getAll error:", error);
        res.status(500).json({ error: "Seyahat verileri yüklenirken hata oluştu." });
    }
};

// GET /api/travel/:id — Public: Get single travel
export const getTravelById = async (req: Request, res: Response): Promise<void> => {
    try {
        const travel = await Travel.findById(req.params.id);
        if (!travel) {
            res.status(404).json({ error: "Seyahat noktası bulunamadı." });
            return;
        }
        res.json(travel);
    } catch (error) {
        console.error("Travel getById error:", error);
        res.status(500).json({ error: "Sunucu hatası." });
    }
};

// POST /api/admin/travel — Admin: Create travel pin
export const createTravel = async (req: Request, res: Response): Promise<void> => {
    try {
        const travel = new Travel(req.body);
        await travel.save();
        res.status(201).json(travel);
    } catch (error) {
        console.error("Travel create error:", error);
        res.status(400).json({ error: "Seyahat noktası oluşturulurken hata oluştu." });
    }
};

// PUT /api/admin/travel/:id — Admin: Update travel pin
export const updateTravel = async (req: Request, res: Response): Promise<void> => {
    try {
        const travel = await Travel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!travel) {
            res.status(404).json({ error: "Seyahat noktası bulunamadı." });
            return;
        }
        res.json(travel);
    } catch (error) {
        console.error("Travel update error:", error);
        res.status(400).json({ error: "Güncelleme sırasında hata oluştu." });
    }
};

// DELETE /api/admin/travel/:id — Admin: Delete travel pin
export const deleteTravel = async (req: Request, res: Response): Promise<void> => {
    try {
        const travel = await Travel.findByIdAndDelete(req.params.id);
        if (!travel) {
            res.status(404).json({ error: "Seyahat noktası bulunamadı." });
            return;
        }
        res.json({ message: "Seyahat noktası silindi." });
    } catch (error) {
        console.error("Travel delete error:", error);
        res.status(500).json({ error: "Silme sırasında hata oluştu." });
    }
};

// GET /api/admin/travel — Admin: Get ALL travels (including inactive)
export const getAllTravelsAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const travels = await Travel.find().sort({ order: 1 });
        res.json(travels);
    } catch (error) {
        console.error("Travel getAllAdmin error:", error);
        res.status(500).json({ error: "Seyahat verileri yüklenirken hata oluştu." });
    }
};
