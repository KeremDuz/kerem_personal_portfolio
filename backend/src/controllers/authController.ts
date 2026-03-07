import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
            return;
        }

        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
            return;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            res.status(500).json({ error: "JWT secret tanımlanmamış." });
            return;
        }

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Giriş sırasında hata oluştu." });
    }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ error: "Kullanıcı bulunamadı." });
            return;
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası." });
    }
};
