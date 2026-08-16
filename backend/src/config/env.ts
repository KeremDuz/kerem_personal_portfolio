import { z } from "zod";

const environmentSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5_000),
    FRONTEND_URL: z.string().min(1).default("http://localhost:3000"),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must contain at least 16 characters"),
    ANALYTICS_HASH_SALT: z.string().min(16).optional(),
});

export default function validateEnvironment() {
    const result = environmentSchema.safeParse(process.env);
    if (!result.success) {
        const details = result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ");
        throw new Error(`Invalid environment configuration: ${details}`);
    }

    return result.data;
}
