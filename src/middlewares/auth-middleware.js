import { StatusCodes } from "http-status-codes"

import { Logger, RedisClient } from "../config/index.js"
import { verifyJwt } from "../utils/helpers/verify-jwt.js"
import { ErrorResponse } from "../utils/common/response.js"
import { generateJwt } from "../utils/common/generate-jwt.js"

async function validateSignupRequest(req, res, next)
{
    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("body not found in request"));
    }

    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please enter a valid email address"));
    }

    if (!password || password.length < 6 || password.includes(' ')) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Password must have minimum 6 characters, with no spaces"));
    }

    next();
}

async function validateVerifySignupRequest(req, res, next)
{
    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("body not found in request"));
    }

    const { email, password, otp } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please enter a valid email address"));
    }

    if (!password || password.length < 6 || password.includes(' ')) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Password must have minimum 6 characters, with no spaces"));
    }

    if (!otp) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please provide the OTP sent to your email"));
    }

    next();
}

async function validateLoginRequest(req, res, next)
{
    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("body not found in request"));
    }

    const { email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please enter a valid email address"));
    }

    if (!password || password.length < 6 || password.includes(' ')) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Password must have minimum 6 characters, with no spaces"));
    }

    next();
}

async function validateResetPasswordRequest(req, res, next)
{
    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("body not found in request"));
    }

    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please enter a valid email address"));
    }

    next();
}

async function validateVerifyResetPasswordRequest(req, res, next)
{
    if (!req.body) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("body not found in request"));
    }

    const { email, password, otp } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please enter a valid email address"));
    }

    if (!password || password.length < 6 || password.includes(' ')) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Password must have minimum 6 characters, with no spaces"));
    }

    if (!otp) {
        return res.status(StatusCodes.BAD_REQUEST).json(new ErrorResponse("Please provide the OTP sent to your email"));
    }

    next();
}

async function authCheck(req, res, next)
{
    let data = {};
    let tokenExpired = false;
    const token = req.cookies?.access_token;

    try {
        data = verifyJwt(token);
    }
    catch(err) {
        if (err.name == "TokenExpiredError")
        {
            tokenExpired = true;
            data = verifyJwt(token, { ignoreExpiration: true });
        }
        else
            return res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse("Please signup or login to continue"));
    }

    if (tokenExpired)
    {
        try {
            const refreshToken = await RedisClient.get(`user_${data.email}_refresh_token`);
            verifyJwt(refreshToken);

            const access_token = generateJwt(data, "5m");

            res.cookie("access_token", access_token, {
                path: "/",
                secure: false,
                httpOnly: true,
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24 * 15,
            })

            Logger.info("Token refreshed");
        }
        catch(err) {
            return res.status(StatusCodes.UNAUTHORIZED).json(new ErrorResponse("Please signup or login to continue"));
        }
    }

    req.user = data;
    next();
}

export { validateSignupRequest, validateVerifySignupRequest, validateLoginRequest, validateResetPasswordRequest, validateVerifyResetPasswordRequest, authCheck }