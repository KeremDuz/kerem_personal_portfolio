import { Request, Response } from "express";
import About from "../models/About";

// For About we usually just need one document, so we fetch the first one.
export const getAbout = async (req: Request, res: Response): Promise<void> => {
    try {
        const about = await About.findOne();
        res.json(about || {});
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
};

export const upsertAbout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find existing or create
        const about = await About.findOne();
        if (about) {
            Object.assign(about, req.body);
            const savedAbout = await about.save();
            res.json(savedAbout);
        } else {
            const newAbout = new About(req.body);
            const savedAbout = await newAbout.save();
            res.status(201).json(savedAbout);
        }
    } catch (error) {
        res.status(400).json({ error: "Geçersiz veri", details: error });
    }
};
