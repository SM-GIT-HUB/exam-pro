import express from "express"
import { TestController } from "../../controllers/index.js"

import authRoutes from "./auth-routes.js"

const router = express.Router();

router.get('/test', TestController.test);
router.use('/auth', authRoutes);

export default router