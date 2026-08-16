/**
 * Local MongoDB for development.
 *
 * The app is built against MongoDB Atlas in production, but a portfolio should
 * be clonable and runnable without anyone signing up for a cloud database
 * first. This boots a real mongod on 127.0.0.1:27017 with its data persisted to
 * `backend/.mongo-data`, so restarts keep whatever you seeded or edited through
 * the admin panel.
 *
 * Point MONGODB_URI at Atlas in `.env` and this script is simply never used.
 */
import fs from "fs";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

const DB_NAME = "keremduz";
const PORT = 27017;
const DATA_DIR = path.resolve(__dirname, "../../.mongo-data");

async function main() {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    const mongod = await MongoMemoryServer.create({
        instance: {
            port: PORT,
            dbName: DB_NAME,
            dbPath: DATA_DIR,
            storageEngine: "wiredTiger",
        },
    });

    const uri = mongod.getUri(DB_NAME);
    console.log(`
🍃 Local MongoDB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Data:  ${DATA_DIR}
🔗 URI:   ${uri}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leave this running. Ctrl+C to stop.
`);

    const shutdown = async () => {
        await mongod.stop();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

main().catch((error) => {
    console.error("Failed to start local MongoDB:", error);
    process.exit(1);
});
