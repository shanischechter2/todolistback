import Koa from "koa";
const cors = require("@koa/cors");
import bodyParser from "koa-bodyparser";
import dotenv from "dotenv";; 
import UserRouter from "./UserRouter";
import TaskRouter from "./TaskRouter";

import { jwtMiddleware} from "./auth";

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 5000;

app.use(bodyParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(jwtMiddleware);
app.use(UserRouter.routes()).use(UserRouter.allowedMethods());
app.use(TaskRouter.routes()).use(TaskRouter.allowedMethods());


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));