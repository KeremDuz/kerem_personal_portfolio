import { Request, Response } from "express";
import UAParser = require("ua-parser-js");
import { createHmac } from "crypto";
import Visitor from "../models/Visitor";

function anonymizeIp(ip: string): string {
    const salt = process.env.ANALYTICS_HASH_SALT || process.env.JWT_SECRET;
    if (!salt) return "anonymous";

    return `sha256:${createHmac("sha256", salt).update(ip).digest("hex")}`;
}

export const trackVisitorEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { action = "page_view", details = "Anasayfa" } = req.body;

        // Ensure we don't spam identical logs from the same IP within a short timeframe
        // (e.g. 5 minutes)
        const ip = anonymizeIp(req.ip || req.socket.remoteAddress || "unknown");

        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        const recentLog = await Visitor.findOne({
            ip,
            action,
            details,
            visitedAt: { $gte: fiveMinsAgo }
        });

        if (recentLog) {
            res.status(200).json({ status: "skipped", message: "Recently logged" });
            return;
        }

        // @ts-ignore - Handle ua-parser-js version inconsistencies gracefully
        const ua = new UAParser(req.headers["user-agent"] || "");
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const device = ua.getDevice();

        let pageStr = "Sitede Dolaşıyor";
        if (action === "page_view") pageStr = `🏠 ${details} sayfasını görüntüledi`;
        else if (action === "click_city") pageStr = `🌍 ${details} şehrine tıkladı`;
        else if (action === "view_photo") pageStr = `📸 ${details} adlı fotoğrafı görüntüledi`;
        else if (action === "view_project") pageStr = `💻 ${details} adlı projeyi inceledi`;

        await Visitor.create({
            ip,
            browser: `${browser.name || "Unknown"} ${browser.version || ""}`.trim(),
            os: `${os.name || "Unknown"} ${os.version || ""}`.trim(),
            device: device.type || "desktop",
            page: pageStr,
            action,
            details,
            referrer: req.headers.referer || req.headers.referrer || undefined,
            userAgent: req.headers["user-agent"] || "",
            visitedAt: new Date(),
        });

        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Tracking error:", error);
        res.status(500).json({ error: "Tracking error" });
    }
};
