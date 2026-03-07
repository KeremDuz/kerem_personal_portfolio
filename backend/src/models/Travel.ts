import mongoose, { Schema, Document } from "mongoose";

export interface IMediaItem {
    type: "image" | "video";
    src: string;
    caption?: string;
}

export interface ITravel extends Document {
    lat: number;
    lng: number;
    label: string;
    country: string;
    description: string;
    image: string;
    color: string;
    media: IMediaItem[];
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
    {
        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        src: { type: String, required: true },
        caption: { type: String },
    },
    { _id: false }
);

const TravelSchema = new Schema<ITravel>(
    {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        label: { type: String, required: true },
        country: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        color: { type: String, required: true, default: "#ef4444" },
        media: [MediaItemSchema],
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITravel>("Travel", TravelSchema);
