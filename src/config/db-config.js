import mongoose from "mongoose"
import { ServerConfig, Logger } from "./index.js"

async function connectToDB()
{
    try {
        await mongoose.connect(ServerConfig.MONGO_URI);
        Logger.info("✅ Database connected successfully");
    }
    catch(err) {
        Logger.error("❌ Database connection error:", err);
        throw err;
    }
}

export default connectToDB