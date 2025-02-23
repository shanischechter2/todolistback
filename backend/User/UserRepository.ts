import { error } from 'console';
import {logindb,get_user_by_id,signup_user} from '../database'
import { Context } from "koa";
interface SignUpBody {
    username: string;
    email: string;
    password: string;
  }
export class UserRepository {
     static async signUpUser(ctx: Context) {
      try{
         const body = ctx.request.body as SignUpBody;
        const { username, email, password } = body;
      
        if (!username || !email || !password) {
          ctx.status = 400;
       

          return;
        }
      
        const newUser = { email, username, pass: password };
        const result = await signup_user(newUser);
      
        ctx.status = result.status;
        ctx.body = result;
      }catch (error) {
        ctx.status = 500;
        ctx.body = { error: "Internal Server Error" };
      }
       
      }
      static async Login(ctx: Context) {
        const { email, password } = ctx.request.body as { email: string; password: string };
        if (!email || !password) {
            ctx.status = 400;
            ctx.body = { error: "Email and password are required" };
            return;
        }
    
        const result = await logindb(ctx, email, password);
    
        if (result.error) {
            ctx.status = result.status;
            ctx.body = { error: result.error };
            return;
        }
    
        ctx.status = 200;
        ctx.body = { message: "Login successful", token: result.token };
    }
    static async get_user(ctx: Context) {
        try {
            const resultuser=await get_user_by_id(ctx);
             ctx.body =resultuser;
           } catch (error) {
             console.log(error);
             ctx.status = 500;
             ctx.body = { error: "Internal Server Error" };
           }
    }
    
      
}