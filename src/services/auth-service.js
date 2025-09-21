import axios from "axios"
import { StatusCodes } from "http-status-codes"

import UserService from "./user-service.js"
import AppError from "../utils/errors/app-error.js"
import { RedisClient, ServerConfig } from "../config/index.js"
import { hashPassword } from "../utils/helpers/hash-password.js"
import { logError, generateJwt, generateOtp, sendSignupOtpMail, getNameFromEmail } from "../utils/common/index.js"

const userService = new UserService();

class AuthService {
    constructor() {}

    async signupManual(data)
    {
        try {
            const user = await userService.getByFilter({ email: data.email });

            if (user.length) {
                throw new AppError("The user already exists, please login", StatusCodes.BAD_REQUEST);
            }

            const otp = generateOtp();

            await RedisClient.set(`otp_signup_${data.email}`, JSON.stringify({
                otp,
                tries: 2
            }), { ex: 5 * 60 })

            await sendSignupOtpMail(data.email, otp);

            return { Success: true };
        }
        catch(err) {
            logError("Error in auth-service: signupManual: " + err.message);

            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError(`Cannot create session right now`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async verifyAndSignupManual(data)
    {
        try {
            const key = `otp_signup_${data.email}`;
            const resredis = await RedisClient.get(key);
            
            if (!resredis) {
                throw new AppError("Otp expired, please signup again", StatusCodes.BAD_REQUEST);
            }

            const otpData = resredis;
            const ttl = await RedisClient.ttl(key);

            if (data.otp.toString() != otpData.otp.toString())
            {
                if (otpData.tries > 1)
                {
                    await RedisClient.set(key, JSON.stringify({
                        otp: otpData.otp,
                        tries: 1
                    }), { ex: ttl })

                    throw new AppError("Otp didn't match, 1 try remaining", StatusCodes.BAD_REQUEST);
                }
                else
                {
                    await RedisClient.del(key);
                    throw new AppError("Otp didn't match. Try limit exceed, please Signup again", StatusCodes.BAD_REQUEST);
                }
            }
            else
                await RedisClient.del(key);

            const user = await userService.create({
                name: getNameFromEmail(data.email),
                email: data.email,
                provider: "manual",
                passwordHash: await hashPassword(data.password)
            })

            const token = generateJwt(user, "15m");
            const refreshToken = generateJwt(user, "15d");
            await RedisClient.set(`user_${user.email}_refresh_token`, refreshToken, { ex: 60 * 60 * 24 * 15 });

            return { user, token };
        }
        catch(err) {
            logError("Error in auth-service: verifyAndSignupManual: " + err.message);

            if (err instanceof AppError) {
                throw err;
            }

            if (err.name.includes("Mongo")) {
                throw new AppError(`Cannot create a new ${this.modelName} Object:: ${err.errorResponse.errmsg}`, StatusCodes.BAD_REQUEST);
            }

            throw new AppError(`Cannot signup, something went wrong`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async githubOAuth(code)
    {
        try {
            const tokenRes = await axios.post("https://github.com/login/oauth/access_token", {
                client_id: ServerConfig.GITHUB_CLIENT_ID,
                client_secret: ServerConfig.GITHUB_CLIENT_SECRET,
                code
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })

            const tokenData = tokenRes.data;

            if (!tokenData.access_token) {
                throw new AppError("Failed to get Github access token", StatusCodes.NOT_FOUND);
            }

            const accessToken = tokenData.access_token;

            const userRes = await axios.get("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            const githubUser = userRes.data;
            let email = githubUser.email;

            if (!email)
            {
                const emailsRes = await axios.get("https://api.github.com/user/emails", {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                const emails = await emailsRes.data;
                email = emails.find(e => e.primary).email;
            }

            let user = await userService.getByFilter({ email });

            if (!user.length)
            {
                user = await userService.create({
                    name: githubUser.login,
                    email,
                    githubId: githubUser.id,
                    provider: "github"
                })
            }
            else if (user[0].provider != "github") {
                throw new AppError(`Email already in use with another provider: ${user[0].provider}`, StatusCodes.BAD_REQUEST);
            }
            else
                user = user[0];

            const token = generateJwt(user, "15m");
            const refreshToken = generateJwt(user, "15d");

            await RedisClient.set(`user_${email}_refresh_token`, refreshToken, { ex: 60 * 60 * 24 * 15 });

            return { user, token };
        }
        catch(err) {
            logError("Error in auth-service: githubOAuth: " + err.message);

            if (err instanceof AppError) {
                throw err;
            }

            if (err.name.includes("Mongo")) {
                throw new AppError(`Auth failed:: ${err.errorResponse.errmsg}`, StatusCodes.BAD_REQUEST);
            }

            throw new AppError(`Auth failed, something went wrong`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export default AuthService