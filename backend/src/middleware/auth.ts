import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { adminSessionCookieName } from "../config/auth";

export interface AuthRequest extends Request {
    userId?: string;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const bearerToken = req.header("Authorization")?.replace(/^Bearer\s+/i, "");
        const cookieToken = req.headers.cookie
            ?.split(";")
            .map((part) => part.trim().split("="))
            .find(([name]) => name === adminSessionCookieName())?.[1];
        const token = bearerToken || (cookieToken ? decodeURIComponent(cookieToken) : undefined);

        if (!token) {
            res.status(401).json({ error: "Erişim reddedildi. Token bulunamadı." });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ error: "JWT secret tanımlanmamış." });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: "Geçersiz token." });
    }
};

export default auth;
