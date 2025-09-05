import { StatusCodes } from "http-status-codes"
import { AuthService } from "../services/index.js"
import { ErrorResponse, SuccessResponse } from "../utils/common/response.js"

const authService = new AuthService();

async function signupmanual(req, res)
{
    try {
        await authService.signupManual({
            email: req.body.email
        })

        return res.status(StatusCodes.OK).json(new SuccessResponse(`You're ready to signup, please enter the otp sent to your email: ${req.body.email}`));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message || "Something went wrong", err));
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
        return res.status(err.statusCode).json(new ErrorResponse(err.message || "Something went wrong", err));
    }
}

async function githubAuth(req, res)
{
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = "http://localhost:3000/api/v1/auth/oauth/github/callback";
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    return res.redirect(githubUrl);
}

async function githubCallback(req, res)
{
    try {
        const { user, token } = await authService.githubOAuth(req.query.code);

        res.cookie("access_token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24
        })

        return res.redirect("http://localhost:5173");
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse(err.message || "Something went wrong", err));
    }
}

export { signupmanual, verifyAndSignupManual, githubAuth, githubCallback }