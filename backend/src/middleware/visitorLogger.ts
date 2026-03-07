import { Request, Response, NextFunction } from "express";
import UAParser from "ua-parser-js";
import Visitor from "../models/Visitor";

const visitorLogger = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Skip logging for admin API routes, auth routes, health checks, and static assets
        if (
            req.path.startsWith("/api/admin") ||
            req.path.startsWith("/api/auth") ||
            req.path === "/api/health" ||
            req.path.includes("/admin/") ||
            req.path.includes(".")
        ) {
            return next();
        }

        const ua = new UAParser(req.headers["user-agent"] || "");
        const browser = ua.getBrowser();
        const os = ua.getOS();
        const device = ua.getDevice();

        // Get real IP (consider proxies)
        const ip =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.headers["x-real-ip"] as string ||
            req.socket.remoteAddress ||
            "unknown";

        await Visitor.create({
            ip,
            browser: `${browser.name || "Unknown"} ${browser.version || ""}`.trim(),
            os: `${os.name || "Unknown"} ${os.version || ""}`.trim(),
            device: device.type || "desktop",
            page: req.path || "/",
            referrer: req.headers.referer || req.headers.referrer || undefined,
            userAgent: req.headers["user-agent"] || "",
            visitedAt: new Date(),
        });
    } catch (error) {
        // Don't block the request if logging fails
        console.error("Visitor logging error:", error);
    }

    next();
};

export default visitorLogger;
