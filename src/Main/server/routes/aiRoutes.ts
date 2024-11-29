import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { kimiController } from "../controllers/ai";

const kimiRouter = new Router({ prefix: "/kimi" });
kimiRouter.post("/chat", bodyParser(), kimiController);
export { kimiRouter };
