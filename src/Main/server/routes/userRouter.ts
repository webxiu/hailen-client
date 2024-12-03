import { login, register } from "../controllers/user/index";

import Router from "koa-router";
import bodyParser from "koa-bodyparser";

const userRouter = new Router({ prefix: "/user" });

userRouter.post("/login", bodyParser(), login);
userRouter.post("/register", bodyParser(), register);

export { userRouter };
