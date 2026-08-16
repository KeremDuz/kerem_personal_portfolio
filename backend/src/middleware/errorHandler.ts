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
    // The stack goes to the server log, never to the client. It used to be
    // included in the response body whenever NODE_ENV !== "production", which
    // meant a single missing env var on the host was enough to publish file
    // paths and internals to anyone who could trigger an error.
    const status = err.status || 500;

    if (status >= 500) {
        console.error("❌ Error:", err.message);
        if (err.stack) console.error(err.stack);
    } else {
        console.warn(`Request rejected (${status}):`, err.message);
    }

    // Client errors can safely say what was wrong; server errors stay opaque.
    const message =
        status < 500 && err.message ? err.message : "Sunucu hatası oluştu.";

    res.status(status).json({ error: message });
};

export default errorHandler;
