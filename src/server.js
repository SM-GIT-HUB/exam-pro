import express from "express"
import apiRoutes from "./routes/index.js"

import { ServerConfig, Logger, connectToDb } from "./config/index.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

connectToDb()
.then(() => {
    app.listen(ServerConfig.PORT, () => {
        Logger.info(`✅ Server running on port ${ServerConfig.PORT}`);
    })
})
.catch((err) => {
    Logger.error("❌ Failed to connect DB", err);
    process.exit(1);
})