import jwt from "jsonwebtoken"

export function generateJwt(user, ttl, session)
{
    const payload = {
        id: user._id,
        email: user.email,
        provider: user.provider,
        session
    }

    const options = { expiresIn: ttl };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
}