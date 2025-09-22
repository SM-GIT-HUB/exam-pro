import { StatusCodes } from "http-status-codes"

import { ServerConfig } from "../config/index.js"
import { authService } from "../services/index.js"
import { ErrorResponse, SuccessResponse } from "../utils/common/response.js"

async function signupmanual(req, res)
{
    try {
        await authService.signupManual({
            email: req.body.email
        })

        return res.status(StatusCodes.OK).json(new SuccessResponse(`You're ready to signup, please enter the otp sent to your email: ${req.body.email}`));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message, err));
    }
}

async function verifyAndSignupManual(req, res)
{
    try {
        const { user, token } = await authService.verifyAndSignupManual(req.body);
        user.passwordHash = null;

        res.cookie("access_token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24
        })

        return res.status(StatusCodes.CREATED).json(new SuccessResponse("Signup successful", user));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message, err));
    }
}

async function githubAuth(req, res)
{
    const clientId = ServerConfig.GITHUB_CLIENT_ID;
    const redirectUri = `${ServerConfig.SERVER_URL}/api/v1/auth/oauth/github/callback`;
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    return res.redirect(githubUrl);
}

async function githubCallback(req, res)
{
    try {
        const { user, token } = await authService.githubOAuth(req.query.code);

        res.cookie("access_token", token, {
            path: "/",
            secure: false,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 15
        })

        return res.redirect(ServerConfig.FRONTEND_URL);
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message, err));
    }
}

async function login(req, res)
{
    try {
        const { user, token } = await authService.login({ email: req.body.email, password: req.body.password });

        res.cookie("access_token", token, {
            path: "/",
            secure: false,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 15
        })

        return res.status(StatusCodes.OK).json(new SuccessResponse("Logged in"));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message, err));
    }
}

async function logout(req, res)
{
    try {
        await authService.logout(req.user);

        res.cookie("access_token", "", {
            path: "/",
            secure: false,
            httpOnly: true,
            sameSite: "none",
            maxAge: 0
        })

        return res.status(StatusCodes.OK).json(new SuccessResponse("Logged out from all devices"));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse("Something went wrong", err));
    }
}

export { signupmanual, verifyAndSignupManual, githubAuth, githubCallback, login, logout }