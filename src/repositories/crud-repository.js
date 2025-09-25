import { StatusCodes } from "http-status-codes"
import AppError from "../utils/errors/app-error.js"
import { UserModel } from "../models/index.js"

class CrudRepository {
    constructor(model)
    {
        this.model = model;
    }

    async create(data) {
        const response = await this.model.create(data);
        return response;
    }

    async getByFilter(data)
    {
        const reponse = await this.model.find(data);
        return reponse;
    }

    async updateByFilter(filter, data)
    {
        const response = await this.model.updateOne(filter, data);
        return response;
    }
}

export default CrudRepository