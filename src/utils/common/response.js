
class SuccessResponse {
    constructor(message, data)
    {
        this.success = true;
        this.message = message? message : "Successfully completed the request";
        this.data = data? data : {};
        this.error = {};
    }
}

class ErrorResponse {
    constructor(message, err)
    {
        this.success = false;
        this.message = message? message : "Something went wrong";
        this.data = {};
        this.error = err? err : {};
    }
}

export { SuccessResponse, ErrorResponse }