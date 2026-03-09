import { Request, Response } from "express";
import Visitor from "../models/Visitor";

// GET /api/admin/visitors — Admin: Get visitors with pagination
export const getVisitors = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [visitors, uniqueIps] = await Promise.all([
            Visitor.aggregate([
                { $sort: { visitedAt: -1 } },
                {
                    $group: {
                        _id: "$ip",
                        latestVisit: { $max: "$visitedAt" },
                        browser: { $first: "$browser" },
                        os: { $first: "$os" },
                        device: { $first: "$device" },
                        country: { $first: "$country" },
                        actions: {
                            $push: {
                                page: "$page",
                                visitedAt: "$visitedAt"
                            }
                        }
                    }
                },
                { $sort: { latestVisit: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        ip: "$_id",
                        visitedAt: "$latestVisit",
                        browser: 1,
                        os: 1,
                        device: 1,
                        country: 1,
                        actions: 1,
                        _id: 0
                    }
                }
            ]),
            Visitor.distinct("ip")
        ]);

        const total = uniqueIps.length;

        res.json({
            visitors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Visitor getAll error:", error);
        res.status(500).json({ error: "Ziyaretçi verileri yüklenirken hata oluştu." });
    }
};

// GET /api/admin/visitors/stats — Admin: Dashboard stats
export const getVisitorStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();

        // Today
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // This week (last 7 days)
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // This month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalVisitors, todayVisitors, weekVisitors, monthVisitors, uniqueIPs, recentVisitors, topPages, topCountries] =
            await Promise.all([
                Visitor.countDocuments(),
                Visitor.countDocuments({ visitedAt: { $gte: todayStart } }),
                Visitor.countDocuments({ visitedAt: { $gte: weekStart } }),
                Visitor.countDocuments({ visitedAt: { $gte: monthStart } }),
                Visitor.distinct("ip").then((ips) => ips.length),
                Visitor.find().sort({ visitedAt: -1 }).limit(10),
                Visitor.aggregate([
                    { $group: { _id: "$page", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
                Visitor.aggregate([
                    { $match: { country: { $exists: true, $ne: null } } },
                    { $group: { _id: "$country", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
            ]);

        res.json({
            total: totalVisitors,
            today: todayVisitors,
            thisWeek: weekVisitors,
            thisMonth: monthVisitors,
            uniqueIPs,
            recentVisitors,
            topPages: topPages.map((p) => ({ page: p._id, count: p.count })),
            topCountries: topCountries.map((c) => ({ country: c._id, count: c.count })),
        });
    } catch (error) {
        console.error("Visitor stats error:", error);
        res.status(500).json({ error: "İstatistikler yüklenirken hata oluştu." });
    }
};

// DELETE /api/admin/visitors — Admin: Clear old visitors
export const clearOldVisitors = async (req: Request, res: Response): Promise<void> => {
    try {
        const days = parseInt(req.query.days as string) || 90;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await Visitor.deleteMany({ visitedAt: { $lt: cutoff } });
        res.json({ message: `${result.deletedCount} eski kayıt silindi.` });
    } catch (error) {
        console.error("Visitor clearOld error:", error);
        res.status(500).json({ error: "Temizleme sırasında hata oluştu." });
    }
};
