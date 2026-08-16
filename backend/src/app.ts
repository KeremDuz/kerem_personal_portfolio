import "./config/loadEnv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import errorHandler from "./middleware/errorHandler";
import requireAjaxMutation from "./middleware/requireAjaxMutation";
import authRoutes from "./routes/authRoutes";
import travelRoutes from "./routes/travelRoutes";
import blogRoutes from "./routes/blogRoutes";
import projectRoutes from "./routes/projectRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import timelineRoutes from "./routes/timelineRoutes";
import aboutRoutes from "./routes/aboutRoutes";
import githubRoutes from "./routes/githubRoutes";
import trackRoutes from "./routes/trackRoutes";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            const error = Object.assign(
                new Error("CORS policy: origin not allowed"),
                { status: 403 }
            );
            callback(error);
        },
        credentials: true,
    })
);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin." },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/api", requireAjaxMutation);
app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth") || req.path.includes("/admin")) {
        res.setHeader("Cache-Control", "private, no-store");
    }
    next();
});

app.use("/api/track", trackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin/visitors", visitorRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/github", githubRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: `Endpoint bulunamadı: ${req.method} ${req.path}` });
});

app.use(errorHandler);

export default app;
