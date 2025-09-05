import { StatusCodes } from "http-status-codes"

function test(req, res)
{
    return res.status(StatusCodes.OK).json({
        success: true,
        message: "Hello World!",
        error: {},
        data: { info: "API is live" }
    })
}


export { test }