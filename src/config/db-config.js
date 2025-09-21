import mongoose from "mongoose"
import Logger from "./logger-config.js"
import { MONGO_URI } from "./server-config.js"

async function connectToDB()
{
    try {
        await mongoose.connect(MONGO_URI);
        Logger.info("✅ Database connected successfully");
    }
    catch(err) {
        Logger.error("❌ Database connection error:", err);
        throw err;
    }
}

export default connectToDB