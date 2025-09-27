import mongoose from "mongoose"
import Logger from "./logger-config.js"
import { MONGO_URI } from "./server-config.js"
import { logError } from "../utils/common/log-error.js"

async function connectToDB()
{
    try {
        await mongoose.connect(MONGO_URI);
        Logger.info("✅ Database connected successfully");
    }
    catch(err) {
        logError("Failed to connect to DB: " + err.message);
        throw err;
    }
}

export default connectToDB