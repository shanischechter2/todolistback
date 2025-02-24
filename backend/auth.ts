import jwt from "jsonwebtoken";
import { Context, Next } from "koa";
import {User} from './User/user'
const SECRET_KEY = "shani";

export const jwtMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.cookies.get("token");

  if (!token) {
    console.warn("No token found in cookies.");
    return await next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    ctx.state.user = decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    ctx.cookies.set("token", "", { maxAge: 0 });
  }

  return await next();
};

export const insertToToken = (ctx: Context, user: Pick<User,"user_id">) => {
  const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, { expiresIn: "1h" });

  ctx.cookies.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });


  return token;
};

