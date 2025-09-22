
class AppError extends Error {
    constructor(message, statusCode, explanation)
    {
        super(message);
        this.statusCode = statusCode;
        this.explanation = explanation;
    }
}

export default AppError