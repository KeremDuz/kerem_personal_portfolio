import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import User from "../models/User";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const seedAdmin = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error("❌ MONGODB_URI tanımlanmamış. .env dosyasını kontrol edin.");
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB'ye bağlanıldı.");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: "admin" });
        if (existingAdmin) {
            console.log("ℹ️  Admin kullanıcısı zaten mevcut. Atlaniyor.");
            await mongoose.disconnect();
            process.exit(0);
        }

        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error("❌ ADMIN_PASSWORD tanımlanmamış. .env dosyasını kontrol edin.");
            await mongoose.disconnect();
            process.exit(1);
        }

        const admin = new User({
            username: adminUsername,
            password: adminPassword,
            role: "admin",
        });

        await admin.save();
        console.log(`✅ Admin kullanıcısı oluşturuldu: ${adminUsername}`);

        await mongoose.disconnect();
        console.log("✅ Veritabanı bağlantısı kapatıldı.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed hatası:", error);
        process.exit(1);
    }
};

seedAdmin();
