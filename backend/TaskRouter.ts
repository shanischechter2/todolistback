import Router from "@koa/router";
import { TaskRepository } from "./TaskRipository";
import { jwtMiddleware } from "./auth";

const TaskRouter = new Router();
TaskRouter.get("/getalltasksbyuser",jwtMiddleware,TaskRepository.get_all_tasks_by_user_id);
TaskRouter.delete("/deletetask/:task_id",jwtMiddleware,TaskRepository.delete_task_by_id);
TaskRouter.put("/updatrelevant/:task_id",jwtMiddleware,TaskRepository.updat_relevant_for_task);
TaskRouter.put("/updatecheck/:task_id",jwtMiddleware,TaskRepository.updat_complete_for_task);
TaskRouter.post("/addtask",jwtMiddleware,TaskRepository.add_task);

export default TaskRouter;