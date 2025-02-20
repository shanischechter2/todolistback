import knex from "./knex";
import { User } from "./user"; 
import { TaskItemProps as Task } from "./task"; 
import { insertToToken,isatho } from "./auth";
import bcrypt from "bcrypt";
import { error } from "console";
import { Context } from "koa";





export const logindb = async (ctx:Context, email: string, password: string) => {
  try {
    const user = await knex<User>("users").where("email", email).first() as User;

    if (!user) {
        return { error: "Invalid email or password", status: 401 };
    }

    if (password!=user.pass) {
        return { error: "Invalid email or password", status: 401 };
    }

    const token = insertToToken(ctx, user);
  
    if (!token) {
        return { error: "Token generation failed", status: 401 };
    }
    
    return { token };
} catch (error) {
    console.error("Login error:", error);
    return { error: "Internal Server Error", status: 500 };
}
}
 
export const get_user_by_id = async (ctx: any) => {
     try{
        const userId = ctx.state.user?.user_id;     
    console.log("sta: "+ ctx.state);
   const result = await knex<User>("users").select("*").where("user_id",userId);
    return result[0];
     }catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  

  };
  export const signup_user = async (user: Omit<User, "user_id">) => {
    try{
          const resultusername = await knex<User>("users").where("username", user.username).first();
    if(resultusername)
    {
      return { error: "The username is already in use by another user", status: 400 };
    }
    const resultuseremail = await knex<User>("users").where("email", user.email).first();
    if(resultuseremail)
    {
      return { error: "The email is already in use by another user", status: 400 };
    }
    const result = await knex("users")
        .insert({
          username:user.username,
          email: user.email,
          pass:user.pass
        })
        .returning("*");

        return { message: "User created successfully", status: 201 };
      } catch (error) {
        console.error("Signup error:", error);
        return { error: "Internal Server Error", status: 500 };
      }
    
  };
  export const get_all_tasks_by_user = async (ctx: any) => {
    try{
       const userId = ctx.state.user?.user_id;
    const result = await knex<Task>("tasks").select("*").where("user_id",userId).orderBy("timecreated", "desc");
    return result;
    }catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
   
  };
 
  export const delete_task_by_id = async (ctx: any,task_id:string) => {
    try{
       const result = await knex("tasks").delete().where("task_id",task_id);
    return result;
    }catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
   
  };
  export const relevance_task_by_id = async (ctx: any,task_id:string,isrelevant:boolean) => {
    try{
       const result = await knex("tasks").update("isrelevant",isrelevant).where("task_id",task_id);
   console.log(result);
   if (!result) {
        ctx.status = 404;
        ctx.body = JSON.stringify({ error: "Task not found" }); 
        return;
      }

    return result;
    }catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  
  };
  export const updatecheck = async (ctx: any,task_id:string,isComplete:boolean) => {
   try{
     const result = await knex("tasks").update("iscomplete",isComplete).where("task_id",task_id);
   // console.log(result);
    if (!result) {
         ctx.status = 404;
         ctx.body = JSON.stringify({ error: "Task not found" }); 
         return;
       }
 
     return result;
   }catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
   
   };
  

   
   export const add_new_task = async (ctx: any,task: Omit<Task, "task_id"|"user_id">) => {
    try {
      const userId = ctx.state.user?.user_id
      const result = await knex("tasks")
        .insert({
          user_id: userId,
          taskbody: task.taskbody,
          timecreated: task.timecreated,
          timeout: task.timeout,
          iscomplete: task.iscomplete,
          isrelevant: task.isrelevant,
        })
        .returning("*");
      console.log(result[0]);
      return result[0];
    } catch (error) {
      console.error("Error adding new task:", error);
      throw new Error("Database Insertion Failed");
    }
  };
  