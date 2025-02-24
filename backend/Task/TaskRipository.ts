
import { Context } from "koa";
import { Task} from './task';
import { User } from '../User/user';
import { task_object } from './AddingTask';
import { Database } from "../database";


export const TaskRepository = {
  async get_all_tasks_by_user_id(ctx: Context) {
    try {
      const userId = ctx.state.user?.user_id as Pick<User, "user_id">;
      const result = await Database.get_all_tasks_by_user(userId) ;
      ctx.body = result;
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  },
  async delete_task_by_id_repository(ctx: Context) {
    try {
      const { task_id } = ctx.params as Pick<Task, "task_id">;
      const result = await Database.delete_task_by_id({ task_id });
      ctx.body = result;
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  },
  async update_relevant_for_task(ctx: Context) {
    try {

      const { task_id } = ctx.params as Pick<Task, "task_id">;
      const { isrelevant } = ctx.request.body as Pick<Task, "isrelevant">;

      const result = await Database.relevance_task_by_id({ task_id, isrelevant });
      ctx.body = JSON.stringify(result);

    } catch (error) {
      console.error("Error updating relevance:", error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  },
  async update_complete_for_task(ctx: Context) {
    try {

      const { task_id } = ctx.params as Pick<Task, "task_id">;
      const { iscomplete } = ctx.request.body as Pick<Task, "iscomplete">;

    
      const result = await Database.update_iscomplete({ task_id, iscomplete });
      ctx.body = result;
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  },
  async add_task(ctx: Context) {
   const user_id: Pick<User, "user_id"> = { user_id: ctx.state.user?.user_id || "" };
    const { taskbody, timeout } = ctx.request.body as Pick<Task, "taskbody" | "timeout">;
    if (!taskbody) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
    const newTask = task_object({ timeout, taskbody }, user_id) as Omit<Task, "task_id">;
    console.log(newTask);
    const result = await Database.add_new_task(newTask);
    ctx.status = 201;
    ctx.body = result;
    return result;
  }
};      
