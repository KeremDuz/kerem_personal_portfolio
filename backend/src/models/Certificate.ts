import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
    title: string;
    issuer: string;
    date: string;
    color: string;
    icon: "shield" | "code" | "globe" | "award";
    image?: string;
    link?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
    {
        title: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String, required: true },
        color: { type: String, required: true, default: "#22c55e" },
        icon: {
            type: String,
            enum: ["shield", "code", "globe", "award"],
            default: "award",
        },
        image: { type: String },
        link: { type: String },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICertificate>("Certificate", CertificateSchema);
