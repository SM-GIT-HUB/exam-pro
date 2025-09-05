import { UserModel } from "../models/index.js"
import CrudRepository from "./crud-repository.js"

class UserRepository extends CrudRepository {
    constructor()
    {
        super(UserModel);
    }
}

export default UserRepository