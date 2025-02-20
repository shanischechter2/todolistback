import Koa from "koa";
import Router from "@koa/router";
import koaBody from "koa-body";
const cors = require("@koa/cors");
import bodyParser from "koa-bodyparser";
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 

import { TaskItemProps as Task } from "./task"; 
import { isatho, insertToToken } from "./auth";
import {logindb,get_user_by_id,
  get_all_tasks_by_user,
  delete_task_by_id,
  relevance_task_by_id,
  updatecheck,
  add_new_task,
  signup_user}
   from "./database";




dotenv.config();

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 5000;



app.use(bodyParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(isatho);
app.use(router.routes()).use(router.allowedMethods());
import UserRouter from "./UserRouter";

// Use the user routes
app.use(UserRouter.routes()).use(UserRouter.allowedMethods());


// router.post("/signup", async (ctx) => {


//      const { username, email, password } = ctx.request.body;

//     if (!username || !email || !password) {
//       ctx.status = 400;
//       ctx.body = { error: "All fields are required" };
//       return;
//     }
//     const newuser = {
//       email: email,
//       username: username,
//       pass: password
//     };
//     await signup_user( newuser);
  
//   //  ctx.response.body = { message: "User registered successfully" };
  
// });
// router.post("/login", async (ctx) => {
//  try {
  //  const { email, password } = ctx.request.body as { email: string; password: string };
  //   if (!email || !password) {
  //     ctx.status = 400;
  //     ctx.body = { error: "Email and password are required"};
  //     return;
  //   }
  //   const token = await logindb(email,password);
 
  //   if(!token)
  //   {
  //     ctx.status=401;
  //     ctx.body = { error: "Internal Server Error" };
  //   }
  //   ctx.body = { message: "Login successful", token };
  // } catch (error) {
  //   ctx.status = 500;
  //   ctx.body = { error: "Internal Server Error" };
  // }
// });

router.post("/addtask",isatho, async (ctx) => {
  
    const { taskbody, timeOut } = ctx.request.body;
    if (!taskbody) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
     const newTask = {
      taskbody,
      timecreated: new Date().toISOString(),
      timeout: new Date(timeOut).toISOString(),
      iscomplete: false,
      isrelevant: true,
    };
    const result =await add_new_task(ctx,newTask);
    ctx.status = 201;
    ctx.body = result;
    return result;
  
});
router.get("/getusername",isatho, async (ctx) => {
  try {
   const resultuser=await get_user_by_id(ctx);
    ctx.body =resultuser;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.get("/getalltasksbyuser",isatho, async (ctx) => {
  try {
   const result= await get_all_tasks_by_user(ctx);
    ctx.body = result;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.put("/updatecheck/:task_id",isatho, async (ctx) => {
  try {
   // console.log(ctx.body);
  const { task_id } = ctx.params as {task_id :string};
  const {isComplete} = ctx.request.body as { isComplete :boolean};

  console.log(isComplete);
  
  const result=await updatecheck(ctx,task_id,isComplete);
   ctx.body = result;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.put("/updatrelevant/:task_id", async (ctx) => {
  try {
    
  const { task_id } = ctx.params as { task_id: string};
  const { isrelevant } = ctx.request.body as {isrelevant : boolean};

  const result = await relevance_task_by_id(ctx,task_id,isrelevant);
  ctx.body = JSON.stringify(result);
 
  } catch (error) {
    console.error("Error updating relevance:", error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.delete("/deletetask/:task_id", async (ctx) => {
  try {
    const { task_id } = ctx.params;
    const result = await delete_task_by_id(ctx,task_id);
    ctx.body = result;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));