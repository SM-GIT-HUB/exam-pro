import jwt from "jsonwebtoken"
import { ServerConfig } from "../../config/index.js"

export function verifyJwt(token, option = {})
{
    const decoded = jwt.verify(token, ServerConfig.JWT_SECRET, option);
    return decoded;
}