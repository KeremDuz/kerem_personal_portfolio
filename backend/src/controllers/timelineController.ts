import { Request, Response } from "express";
import Timeline from "../models/Timeline";

export const getAllTimelines = async (req: Request, res: Response): Promise<void> => {
    try {
        const timelines = await Timeline.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(timelines);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
};

export const getAllAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const timelines = await Timeline.find().sort({ order: 1, createdAt: -1 });
        res.json(timelines);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
};

export const createTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const timeline = new Timeline(req.body);
        const savedTimeline = await timeline.save();
        res.status(201).json(savedTimeline);
    } catch (error) {
        res.status(400).json({ error: "Geçersiz veri" });
    }
};

export const updateTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const timeline = await Timeline.findByIdAndUpdate(id, req.body, { new: true });
        if (!timeline) {
            res.status(404).json({ error: "Timeline bulunamadı" });
            return;
        }
        res.json(timeline);
    } catch (error) {
        res.status(400).json({ error: "Geçersiz veri" });
    }
};

export const deleteTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const timeline = await Timeline.findByIdAndDelete(id);
        if (!timeline) {
            res.status(404).json({ error: "Timeline bulunamadı" });
            return;
        }
        res.json({ message: "Timeline başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }
};
