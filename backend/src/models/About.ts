import mongoose, { Schema, Document } from "mongoose";

export interface IAbout extends Document {
    terminal_title: string;
    p1_1: string;
    p1_2: string;
    p1_3: string;
    p2: string;
    p3: string;
    focusLabel: string;
    focusValue: string;
    expertiseLabel: string;
    expertiseValue: string;
    locationLabel: string;
    locationValue: string;
    fuelLabel: string;
    fuelValue: string;
    createdAt: Date;
    updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
    {
        terminal_title: { type: String, required: true },
        p1_1: { type: String, required: true },
        p1_2: { type: String, required: true },
        p1_3: { type: String, required: true },
        p2: { type: String, required: true },
        p3: { type: String, required: true },
        focusLabel: { type: String, required: true },
        focusValue: { type: String, required: true },
        expertiseLabel: { type: String, required: true },
        expertiseValue: { type: String, required: true },
        locationLabel: { type: String, required: true },
        locationValue: { type: String, required: true },
        fuelLabel: { type: String, required: true },
        fuelValue: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IAbout>("About", AboutSchema);
