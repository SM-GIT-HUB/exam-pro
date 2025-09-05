import { createLogger, format, transports } from "winston"

const { combine, timestamp, label, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} : ${level} : ${message}`;
})

const logger = createLogger({
    transports: [
        new transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        }),
        new transports.File({
            filename: 'combined.log',
            level: "warn",
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                customFormat
            )
        })
    ]
})

export default logger