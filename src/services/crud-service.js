import { StatusCodes } from "http-status-codes"
import AppError from "../utils/errors/app-error.js"
import { logError } from "../utils/common/log-error.js"

class CrudService {
    constructor(modelName, repository)
    {
        this.modelName = modelName;
        this.repository = repository;
    }

    async create(data)
    {
        try {
            const response = await this.repository.create(data);
            return response;
        }
        catch(err) {
            logError("Error in crud-service: " + err.message);

            if (err.name.includes("Mongo")) {
                throw new AppError(`Cannot create a new ${this.modelName} Object:: ${err.errorResponse.errmsg}`, StatusCodes.BAD_REQUEST);
            }
            
            throw new AppError(`Cannot create a new ${this.modelName} Object:: ${err}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getByFilter(data)
    {
        try {
            const response = await this.repository.getByFilter(data);
            return response;
        }
        catch(err) {
            logError("Error in crud-service: " + err.message);

            if (err.name.includes("Mongo")) {
                throw new AppError(`Cannot get requested data:: ${err.errorResponse.errmsg}`, StatusCodes.BAD_REQUEST);
            }
            
            throw new AppError(`Cannot get requested data:: ${err}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export default CrudService