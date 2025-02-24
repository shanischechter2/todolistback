
import { Database} from '../database'
import { Context } from "koa";
import {User} from './user';
import {UserTests} from './userTest'


export const UserRepository = {
 async signUpUser(ctx: Context) {
    try {   
      const { username, email, password } = ctx.request.body as Omit<User,"user_id"> ;
      if (!UserTests.sign_in_test({email,username,password})) {
        ctx.status = 400;
        return;
      }
      const newUser = { email, username, password: password };
      const result = await Database.signup_user(newUser);

      ctx.status = result.status;
      ctx.body = result;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }

  },
  async Login(ctx: Context) {
    const { email, password } = ctx.request.body as  Omit<User,"user_id"| "username">;
    if (!UserTests.log_in_test({email,password})) {
      ctx.status = 400;
      return;
    }
    
    const result = await Database.logindb(ctx, {email, password});

    if (result.error) {
      ctx.status = result.status;
      ctx.body = { error: result.error };
      return;
    }

    ctx.status = 200;
    ctx.body = { message: "Login successful", token: result.token };
  },
 async get_user(ctx: Context) {
    try {
      const resultuser = await Database.get_user_by_id(ctx);
      ctx.body = resultuser;
    } catch (error) {
      console.log(error);
      ctx.status = 500;
      ctx.body = { error: "Internal Server Error" };
    }
  }
};

