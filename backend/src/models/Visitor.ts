import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
    ip: string;
    country?: string;
    city?: string;
    browser: string;
    os: string;
    device: string;
    page: string;
    referrer?: string;
    userAgent: string;
    visitedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
    {
        ip: { type: String, required: true },
        country: { type: String },
        city: { type: String },
        browser: { type: String, default: "Unknown" },
        os: { type: String, default: "Unknown" },
        device: { type: String, default: "Unknown" },
        page: { type: String, required: true },
        referrer: { type: String },
        userAgent: { type: String },
        visitedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: false,
    }
);

// Index for faster queries on admin dashboard
VisitorSchema.index({ visitedAt: -1 });
VisitorSchema.index({ ip: 1, visitedAt: -1 });

export default mongoose.model<IVisitor>("Visitor", VisitorSchema);
