import type { NextFunction, Request, Response } from "express";

/**
 * Cookie-authenticated mutations must not be triggerable by a plain HTML form.
 * This custom header forces browsers to complete a CORS preflight when the API
 * is called cross-origin and acts as a compact CSRF barrier for same-origin use.
 */
export default function requireAjaxMutation(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        next();
        return;
    }

    if (req.get("X-Requested-With") !== "XMLHttpRequest") {
        res.status(403).json({ error: "Geçersiz istek kaynağı." });
        return;
    }

    next();
}
