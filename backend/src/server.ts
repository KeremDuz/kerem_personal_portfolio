import app from "./app";
import connectDB from "./config/database";
import validateEnvironment from "./config/env";
import mongoose from "mongoose";
import type { Server } from "http";

const env = validateEnvironment();
let httpServer: Server | undefined;

// Start server
const startServer = async () => {
    await connectDB();

    httpServer = app.listen(env.PORT, () => {
        console.log(`
🚀 Antigravity Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port:     ${env.PORT}
🌍 Mode:     ${env.NODE_ENV}
🔗 URL:      http://localhost:${env.PORT}
🏥 Health:   http://localhost:${env.PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    });
};

const shutdown = async (signal: string) => {
    console.log(`${signal} received; closing server gracefully.`);

    await new Promise<void>((resolve) => {
        if (!httpServer) return resolve();
        httpServer.close(() => resolve());
    });
    await mongoose.disconnect();
    process.exit(0);
};

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

export default app;
