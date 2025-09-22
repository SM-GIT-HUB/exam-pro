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
            logError("Error in crud-service: create: " + err.message);

            if (err.name.includes("Mongo")) {
                throw new AppError("We are having some problems, please try again later", StatusCodes.BAD_REQUEST, `Cannot create a new ${this.modelName} Object:: ${err.errorResponse.errmsg}`);
            }
            
            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, `Cannot create a new ${this.modelName} Object:: ${err.message}`);
        }
    }

    async getByFilter(data)
    {
        try {
            const response = await this.repository.getByFilter(data);
            return response;
        }
        catch(err) {
            logError("Error in crud-service: getByFilter: " + err.message);

            if (err.name.includes("Mongo")) {
                throw new AppError("We are having some problems, please try again later", StatusCodes.BAD_REQUEST, `Cannot get requested data:: ${err.errorResponse.errmsg}`);
            }
            
            throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR, `Cannot get requested data:: ${err.message}`);
        }
    }
}

export default CrudService