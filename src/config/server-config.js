import "dotenv/config"

export const PORT = process.env.PORT || 3000
export const MONGO_URI = process.env.MONGO_URI

export const SERVER_URL = process.env.SERVER_URL
export const FRONTEND_URL = process.env.FRONTEND_URL

export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

export const JWT_SECRET = process.env.JWT_SECRET