
import {get_all_tasks_by_user,delete_task_by_id,relevance_task_by_id,update_iscomplete,add_new_task} from './database';
import { Context } from "koa";

export class TaskRepository {
     static async get_all_tasks_by_user_id(ctx: Context) {
        try {
            const userId = ctx.state.user?.user_id;
            const result= await get_all_tasks_by_user(userId);
             ctx.body = result;
           } catch (error) {
             console.log(error);
             ctx.status = 500;
             ctx.body = { error: "Internal Server Error" };
           }
    }
    static async delete_task_by_id(ctx: Context) {
        try {
            const { task_id } = ctx.params as {task_id: string};
            const result = await delete_task_by_id(task_id);
            ctx.body = result;
          } catch (error) {
            console.log(error);
            ctx.status = 500;
            ctx.body = { error: "Internal Server Error" };
          }
    }
    static async updat_relevant_for_task(ctx: Context) {
     try {
    
        const { task_id } = ctx.params as { task_id: string};
        const { isrelevant } = ctx.request.body as {isrelevant : boolean};
      
        const result = await relevance_task_by_id(task_id,isrelevant);
        ctx.body = JSON.stringify(result);
       
        } catch (error) {
          console.error("Error updating relevance:", error);
          ctx.status = 500;
          ctx.body = { error: "Internal Server Error" };
        }
    }
    static async updat_complete_for_task(ctx: Context) {
        try {
        
           const { task_id } = ctx.params as {task_id :string};
           const {isComplete} = ctx.request.body as { isComplete :boolean};
           
           
           const result=await update_iscomplete(task_id,isComplete);
            ctx.body = result;
           } catch (error) {
             console.log(error);
             ctx.status = 500;
             ctx.body = { error: "Internal Server Error" };
           }
    }
    static async add_task(ctx: Context) {
        const userId = ctx.state.user?.user_id ;
         const { taskbody, timeOut } = ctx.request.body as {taskbody:string,timeOut:string};
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
          const result =await add_new_task(userId,newTask);
          ctx.status = 201;
          ctx.body = result;
          return result;
    }
      
}