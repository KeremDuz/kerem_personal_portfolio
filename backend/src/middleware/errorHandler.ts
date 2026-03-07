import { Request, Response, NextFunction } from "express";

interface ErrorWithStatus extends Error {
    status?: number;
}

const errorHandler = (
    err: ErrorWithStatus,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error("❌ Error:", err.message);

    const status = err.status || 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Sunucu hatası oluştu."
            : err.message;

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

export default errorHandler;
