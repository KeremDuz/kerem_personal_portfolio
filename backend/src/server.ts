import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

import connectDB from "./config/database";
import errorHandler from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/authRoutes";
import travelRoutes from "./routes/travelRoutes";
import blogRoutes from "./routes/blogRoutes";
import projectRoutes from "./routes/projectRoutes";
import certificateRoutes from "./routes/certificateRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import uploadRoutes from "./routes/uploadRoutes";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS — support multiple origins (comma-separated in env)
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS policy: origin not allowed"));
            }
        },
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
});
app.use("/api/", limiter);

// Auth endpoints get stricter rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin." },
});
app.use("/api/auth/login", authLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Tracking API Route (instead of universal middleware, frontend explicitly logs views)
import trackRoutes from "./routes/trackRoutes";
app.use("/api/track", trackRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/travel", travelRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin/visitors", visitorRoutes);
app.use("/api/admin/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
🚀 Antigravity Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port:     ${PORT}
🌍 Mode:     ${process.env.NODE_ENV || "development"}
🔗 URL:      http://localhost:${PORT}
🏥 Health:   http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

export default app;
