import type { NextFunction, Request, Response } from "express";

export default function publicCache(seconds = 300) {
    return (_req: Request, res: Response, next: NextFunction): void => {
        res.setHeader(
            "Cache-Control",
            `public, max-age=60, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`
        );
        next();
    };
}
