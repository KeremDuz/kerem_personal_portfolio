import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
    title: string;
    excerpt: string;
    content: string;
    date: string;
    category: "ctf" | "security" | "travel" | "dev";
    readTime: string;
    tags: string[];
    link: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
    {
        title: { type: String, required: true },
        excerpt: { type: String, required: true },
        content: { type: String, default: "" },
        date: { type: String, required: true },
        category: {
            type: String,
            enum: ["ctf", "security", "travel", "dev"],
            required: true,
        },
        readTime: { type: String, required: true },
        tags: [{ type: String }],
        link: { type: String, default: "#" },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
