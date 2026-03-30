import mongoose, { Schema, Document } from "mongoose";

export interface ITimeline extends Document {
    year: string;
    title: string;
    subtitle: string;
    description: string;
    type: "education" | "work" | "certification";
    tags: string[];
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TimelineSchema = new Schema<ITimeline>(
    {
        year: { type: String, required: true },
        title: { type: String, required: true },
        subtitle: { type: String, required: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ["education", "work", "certification"],
            default: "education",
        },
        tags: [{ type: String }],
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITimeline>("Timeline", TimelineSchema);
