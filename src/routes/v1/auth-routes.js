import express from "express"
import { AuthController } from "../../controllers/index.js"

const router = express.Router();

router.post('/signup/manual', AuthController.signupmanual);
router.post('/signup/manual/verify', AuthController.verifyAndSignupManual);

router.get('/oauth/github', AuthController.githubAuth);
router.get('/oauth/github/callback', AuthController.githubCallback);

export default router