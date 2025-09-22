import express from "express"
import { AuthController } from "../../controllers/index.js"
import { AuthMiddleware } from "../../middlewares/index.js";

const router = express.Router();

// /api/v1/auth/signup/manual -- POST -- { email, password }
router.post('/signup/manual', AuthMiddleware.validateSignupRequest, AuthController.signupmanual);

// /api/v1/auth/signup/manual/verify -- POST -- { email, password, otp }
router.post('/signup/manual/verify', AuthMiddleware.validateVerifySignupRequest, AuthController.verifyAndSignupManual);

// /api/v1/auth/login/manual -- POST -- { email, password }
router.post('/login/manual', AuthMiddleware.validateLoginRequest, AuthController.login);

// /api/v1/auth/logout -- POST -- {}
router.post('/logout', AuthMiddleware.authCheck, AuthController.logout);

// /api/v1/auth/oauth/github -- GET -- {}
router.get('/oauth/github', AuthController.githubAuth);

// /api/v1/auth/oauth/github/callback -- GET -- {}
router.get('/oauth/github/callback', AuthController.githubCallback);

export default router