import { Request, Response } from "express";
import Certificate from "../models/Certificate";

// GET /api/certificates — Public
export const getAllCertificates = async (_req: Request, res: Response): Promise<void> => {
    try {
        const certificates = await Certificate.find({ isActive: true }).sort({ order: 1 });
        res.json(certificates);
    } catch (error) {
        console.error("Certificate getAll error:", error);
        res.status(500).json({ error: "Sertifikalar yüklenirken hata oluştu." });
    }
};

// POST /api/admin/certificates — Admin
export const createCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const certificate = new Certificate(req.body);
        await certificate.save();
        res.status(201).json(certificate);
    } catch (error) {
        console.error("Certificate create error:", error);
        res.status(400).json({ error: "Sertifika oluşturulurken hata oluştu." });
    }
};

// PUT /api/admin/certificates/:id — Admin
export const updateCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!certificate) {
            res.status(404).json({ error: "Sertifika bulunamadı." });
            return;
        }
        res.json(certificate);
    } catch (error) {
        console.error("Certificate update error:", error);
        res.status(400).json({ error: "Güncelleme sırasında hata oluştu." });
    }
};

// DELETE /api/admin/certificates/:id — Admin
export const deleteCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);
        if (!certificate) {
            res.status(404).json({ error: "Sertifika bulunamadı." });
            return;
        }
        res.json({ message: "Sertifika silindi." });
    } catch (error) {
        console.error("Certificate delete error:", error);
        res.status(500).json({ error: "Silme sırasında hata oluştu." });
    }
};

// GET /api/admin/certificates — Admin: Get ALL
export const getAllCertificatesAdmin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const certificates = await Certificate.find().sort({ order: 1 });
        res.json(certificates);
    } catch (error) {
        console.error("Certificate getAllAdmin error:", error);
        res.status(500).json({ error: "Sertifikalar yüklenirken hata oluştu." });
    }
};
