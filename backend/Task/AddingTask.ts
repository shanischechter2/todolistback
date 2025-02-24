
import { Task } from './task';
import {User} from '../User/user'


export function task_object(task: Pick<Task, "taskbody" | "timeout"> ,user:Pick<User, "user_id">){
    const newTask: Omit<Task,"task_id">={
        user_id:user.user_id,
        taskbody: task.taskbody,
        timecreated: new Date(),
        timeout: task.timeout,
        iscomplete: false,
        isrelevant: true,
    }
    return newTask;
}
