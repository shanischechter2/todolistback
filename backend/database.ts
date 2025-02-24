import knex from "./knex";
import { User } from "./User/user";
import { Task } from "./Task/task";
import { insertToToken } from "./auth";
import { Context } from "koa";


export const Database = {
 logindb : async (ctx: Context,  userInfo: Omit<User, "user_id" | "username">) => {
  try {
    const user = await knex<User>("users").where("email", userInfo.email).first() as User;
    if (!user||userInfo.password != user.password) {
      return { error: "Invalid email or password", status: 400 };
    }

    const token = insertToToken(ctx, user);

    if (!token) {
      return { error: "Token generation failed", status: 401 };//status numbers fix
    }

    return { token };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Internal database Error", status: 500 };
  }
},

get_user_by_id : async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.user_id;

    const result = await knex<User>("users").select("*").where("user_id", userId) ;
    return result[0];
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal database Error" };
  }


},
signup_user : async (user: Omit<User, "user_id">) => {
  try {
    console.log()
    const resultusername = await knex<User>("users").where("username", user.username).first() as User;
    if (resultusername) {
      return { error: "The username is already in use by another user", status: 400 };
    }
    const resultuseremail = await knex<User>("users").where("email", user.email).first() as User;
    if (resultuseremail) {
      return { error: "The email is already in use by another user", status: 400 };
    }
    await knex("users")
      .insert({
        username: user.username,
        email: user.email,
        password: user.password
      })
      .returning("*");

    return { message: "User created successfully", status: 201 };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Internal database Error", status: 500 }; 
  }

},
 get_all_tasks_by_user :async (userId: Pick<User, "user_id">) => {
  try {
    
    const result = await knex<Task>("tasks").select("*").where("user_id", userId).orderBy([{ column: "timecreated", order: "desc" }, { column: "task_id", order: "desc" }]);
    return result;
  } catch (error) {
    console.log(error);
    return { error: "Internal database Error", status: 500 };
  }

},

delete_task_by_id : async (TaskInfo: Pick<Task, "task_id">) => {
  try {
    const result = await knex("tasks").delete().where("task_id", TaskInfo.task_id);
    return result;
  } catch (error) {
    console.log(error);
    return { error: "Internal database Error", status: 500 };
  }

},
relevance_task_by_id : async (task: Pick<Task, "task_id"|"isrelevant">) => {
  try {
    const result = await knex("tasks").update("isrelevant", task.isrelevant).where("task_id", task.task_id);

    if (!result) {

      return { error: "Task not found", status: 404 };

    }
    return result;
  } catch (error) {
    console.log(error);

    return { error: "Internal database Error", status: 500 };
  }

},
update_iscomplete :async (task: Pick<Task, "task_id"|"iscomplete">) => {
  try {
    const result = await knex("tasks").update("iscomplete", task.iscomplete).where("task_id", task.task_id);

    if (!result) {

      return { error: "Task not found", status: 404 };
    }

    return result;
  } catch (error) {
    console.log(error);
    return { error: "Internal database Error", status: 500 };
  }

},
 add_new_task :async ( task: Omit<Task, "task_id">) => {
  try {
    const result = await knex<Task>("tasks")
      .insert({
        user_id: task.user_id,
        taskbody: task.taskbody,
        timecreated: task.timecreated,
        timeout: task.timeout,
        iscomplete: task.iscomplete,
        isrelevant: task.isrelevant,
      })
      .returning("*");

    return result[0];
  } catch (error) {
    console.error("Error adding new task:", error);
    throw new Error("Database Insertion Failed");
  }
}
};
