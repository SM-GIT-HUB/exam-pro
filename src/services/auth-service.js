import axios from "axios"
import { StatusCodes } from "http-status-codes"

import UserService from "./user-service.js"
import AppError from "../utils/errors/app-error.js"
import { RedisClient, ServerConfig } from "../config/index.js"
import { comparePassword, hashPassword } from "../utils/helpers/hash-password.js"
import { logError, generateJwt, generateOtp, sendSignupOtpMail, getNameFromEmail } from "../utils/common/index.js"

const userService = new UserService();

class AuthService {
    constructor() {}

    async signupManual({ email, password })
    {
        try {
            const [user] = await userService.getByFilter({ email });

            if (user) {
                throw new AppError("The user already exists, please login", StatusCodes.CONFLICT);
            }

            const otp = generateOtp();

            await RedisClient.set(`otp_${email}_signup`, JSON.stringify({
                otp,
                tries: 2
            }), { ex: 5 * 60 })

            sendSignupOtpMail(email, otp).catch((err) => logError("Error in auth-service: signupManual: " + err.message));

            return { success: true };
        }
        catch(err) {
            logError("Error in auth-service: signupManual: " + err.message);

            if (err instanceof AppError) {
                throw err;
            }
            throw new AppError("Cannot create session right now", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async verifyAndSignupManual({ email, password, otp })
    {
        try {
            const key = `otp_${email}_signup`;
            const otpData = await RedisClient.get(key);
            
            if (!otpData) {
                throw new AppError("Otp expired, please signup again", StatusCodes.BAD_REQUEST);
            }

            let [user] = await userService.getByFilter({ email });
        
            if (user) {
                throw new AppError("The user already exists, please login", StatusCodes.CONFLICT);
            }

            if (otp.toString() != otpData.otp.toString())
            {
                if (otpData.tries > 1)
                {
                    const ttl = await RedisClient.ttl(key);
                    await RedisClient.set(key, JSON.stringify({
                        otp: otpData.otp,
                        tries: 1
                    }), { ex: ttl })

                    throw new AppError("Otp didn't match, 1 try remaining", StatusCodes.BAD_REQUEST);
                }
                else
                {
                    await RedisClient.del(key);
                    throw new AppError("Otp didn't match. Try limit exceed, please signup again", StatusCodes.BAD_REQUEST);
                }
            }
            else
                await RedisClient.del(key);

            user = await userService.create({
                name: getNameFromEmail(email),
                email: email,
                provider: "manual",
                passwordHash: await hashPassword(password)
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
                throw new AppError("We are facing some problems, please try again later", StatusCodes.BAD_REQUEST, `Cannot create a new ${this.modelName} Object:: ${err.errorResponse.errmsg}`);
            }

            throw new AppError("Cannot signup, something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
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
                throw new AppError("Please try again", StatusCodes.NOT_FOUND, "Failed to get Github access token");
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
                throw new AppError(`Email already in use with ${user[0].provider}`, StatusCodes.CONFLICT);
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
                throw new AppError("We are facing some problems, please try again later", StatusCodes.BAD_REQUEST, `Auth failed:: ${err.errorResponse.errmsg}`);
            }

            throw new AppError("Something went wrong, please try again", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async login({ email, password })
    {
        try {
            const [user] = await userService.getByFilter({ email });
        
            if (!user) {
                throw new AppError("Account not found", StatusCodes.NOT_FOUND);
            }

            if (user.provider != 'manual') {
                throw new AppError(`Email in use with ${user.provider}`, StatusCodes.CONFLICT);
            }
            
            const passwordHash = user.passwordHash;
            const match = await comparePassword(password, passwordHash);

            if (!match) {
                throw new AppError("Wrong password", StatusCodes.UNAUTHORIZED);
            }

            const token = generateJwt(user, "15m");
            const refreshToken = generateJwt(user, "15d");

            await RedisClient.set(`user_${email}_refresh_token`, refreshToken, { ex: 60 * 60 * 24 * 15 });

            return { user, token };
        }
        catch(err) {
            logError("Error in auth-service: login: " + err.message);
            
            if (err instanceof AppError) {
                throw err;
            }

            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async resetPassword({ email })
    {
        try {
            const [user] = await userService.getByFilter({ email });
        
            if (!user) {
                throw new AppError("Account not found", StatusCodes.NOT_FOUND);
            }

            if (user.provider != 'manual') {
                throw new AppError(`Email in use with ${user.provider}`, StatusCodes.CONFLICT);
            }

            const key = `otp_${email}_password_reset`;
            const otpData = await RedisClient.get(key);

            if (otpData)
            {
                const ttl = await RedisClient.ttl(key);
                throw new AppError(`Too many requests, please try again after ${Math.ceil(ttl / 60)} minutes`);
            }

            const otp = generateOtp();

            await RedisClient.set(key, JSON.stringify({
                otp,
                tries: 2
            }), { ex: 5 * 60 })

            sendSignupOtpMail(data.email, otp).catch((err) => logError("Error in auth-service: resetPassword: " + err.message));

            return { success: true };
        }
        catch(err) {
            logError("Error in auth-service: resetPassword: " + err.message);
            
            if (err instanceof AppError) {
                throw err;
            }

            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async verifyAndResetPassword({ email, password, otp })
    {
        try {
            const [user] = await userService.getByFilter({ email });
        
            if (!user) {
                throw new AppError("Account not found", StatusCodes.NOT_FOUND);
            }

            if (user.provider != 'manual') {
                throw new AppError(`Email in use with ${user.provider}`, StatusCodes.CONFLICT);
            }

            const key = `otp_${email}_password_reset`;
            const otpData = await RedisClient.get(key);
            const ttl = await RedisClient.ttl(key);

            if (!otpData) {
                throw new AppError("Otp expired, please try again", StatusCodes.BAD_REQUEST);
            }
            
            if (otpData.tries == 0) {
                throw new AppError(`Try limit exceed, please try again after ${Math.ceil(ttl / 60)} minutes`);
            }

            if (otp.toString() != otpData.otp.toString())
            {
                const remainingTries = otpData.tries - 1;
                
                await RedisClient.set(key, JSON.stringify({
                    otp: otpData.otp,
                    tries: remainingTries
                }), { ex: ttl })

                if (remainingTries > 0) {
                    throw new AppError("Otp didn't match, 1 try remaining", StatusCodes.BAD_REQUEST);
                }
                else
                    throw new AppError(`Otp didn't match. Try limit exceed, please try again after ${Math.ceil(ttl / 60)} minutes`, StatusCodes.BAD_REQUEST);
            }
            else
                await RedisClient.del(key);

            await userService.updateByFilter({ email }, { password: await hashPassword(password) });
            return { success: true };
        }
        catch(err) {
            logError("Error in auth-service: verifyAndResetPassword: " + err.message);
            
            if (err instanceof AppError) {
                throw err;
            }

            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }

    async logout(user)
    {
        try {
            const key = `user_${user.email}_refresh_token`;
            await RedisClient.del(key);

            return {};
        }
        catch(err) {
            logError("Error in auth-service: logout: " + err.message);
            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        }
    }
}

export default AuthService