
import Router from "@koa/router";
import { UserRepository } from "./UserRepository";

const UserRouter = new Router();

UserRouter.post("/signup", UserRepository.signUpUser);
UserRouter.post("/login", UserRepository.Login);
UserRouter.get("/getusername", UserRepository.get_user);

export default UserRouter;


