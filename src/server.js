import express from "express"
import cookieParser from "cookie-parser"

import apiRoutes from "./routes/index.js"
import { ServerConfig, Logger, connectToDb } from "./config/index.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/api', apiRoutes);

connectToDb()
.then(() => {
    app.listen(ServerConfig.PORT, () => {
        Logger.info(`✅ Server running on port ${ServerConfig.PORT}`);
    })
})
.catch(() => {
    process.exit(1);
})