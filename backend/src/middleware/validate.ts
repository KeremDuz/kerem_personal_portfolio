import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Returns 400 with structured error messages on failure.
 */
const validate =
    (schema: z.ZodType) =>
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const messages = error.issues.map(
                        (issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`
                    );
                    res.status(400).json({
                        error: "Doğrulama hatası.",
                        details: messages,
                    });
                    return;
                }
                next(error);
            }
        };

export default validate;
