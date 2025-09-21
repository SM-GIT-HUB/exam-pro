import { StatusCodes } from "http-status-codes"
import { userService } from "../services/index.js"
import { hashPassword } from "../utils/helpers/hash-password.js"
import { ErrorResponse, SuccessResponse, getNameFromEmail } from "../utils/common/index.js"

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