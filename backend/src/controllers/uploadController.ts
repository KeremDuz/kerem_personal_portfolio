import { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

// Multer memory storage (we'll stream to Cloudinary)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Desteklenmeyen dosya türü."));
        }
    },
});

// POST /api/admin/upload — Admin: Upload file to Cloudinary
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "Dosya bulunamadı." });
            return;
        }

        const folder = req.body.folder || "portfolio";
        const resourceType = req.file.mimetype.startsWith("video") ? "video" : "image";

        // Stream buffer to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `antigravity/${folder}`,
                    resource_type: resourceType,
                    quality: "auto",
                    fetch_format: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            const readableStream = new Readable();
            readableStream.push(req.file!.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.bytes,
            resourceType: result.resource_type,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Dosya yüklenirken hata oluştu." });
    }
};

// DELETE /api/admin/upload/:publicId — Admin: Delete file from Cloudinary
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const publicId = req.params.publicId as string;
        const resourceType = (req.query.type as string) || "image";

        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });

        res.json({ message: "Dosya silindi." });
    } catch (error) {
        res.status(500).json({ error: "Dosya silinirken hata oluştu." });
    }
};
