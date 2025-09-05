import CrudService from "./crud-service.js"
import { UserRepository } from "../repositories/index.js"

const userRepository = new UserRepository();

class UserService extends CrudService {
    constructor()
    {
        super('User', userRepository);
    }
}

export default UserService