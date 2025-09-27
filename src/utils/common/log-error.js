import { Logger } from "../../config/index.js"

export async function logError(message)
{
    Logger.error("❌ " + message);
}