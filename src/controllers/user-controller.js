import { StatusCodes } from "http-status-codes"
import { UserService } from "../services/index.js"
import getNameFromEmail from "../utils/common/email-to-name.js"
import { hashPassword } from "../utils/passwords/hash-password.js"
import { ErrorResponse, SuccessResponse } from "../utils/common/response.js";

const userService = new UserService();

async function createUser(req, res)
{
    try {
        const user = await userService.create({
            name: getNameFromEmail(req.body.email),
            email: req.body.email,
            provider: "manual",
            passwordHash: await hashPassword(req.body.password)
        })
        user.passwordHash = null;

        return res.status(StatusCodes.CREATED).json(new SuccessResponse("Successfully created an user", user));
    }
    catch(err) {
        return res.status(err.statusCode).json(new ErrorResponse("Something went wrong", err));
    }
}

export { createUser }