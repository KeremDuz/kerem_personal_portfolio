import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
    title: string;
    description: string;
    tags: string[];
    icon: string;
    link: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        tags: [{ type: String }],
        icon: {
            type: String,
            enum: ["shield", "code", "terminal", "wifi", "lock", "database", "globe"],
            default: "code",
        },
        link: { type: String, default: "#" },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
