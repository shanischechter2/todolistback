import jwt from "jsonwebtoken";
import { Context, Next } from "koa";

const SECRET_KEY = "shani";

export const jwtMiddleware = async (ctx: Context, next: Next) => {
  const token = ctx.cookies.get("token");

  if (!token) {
    console.warn("No token found in cookies.");
    return await next(); // Proceed to the next middleware
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    ctx.state.user = decoded; // Attach user to ctx.state
  } catch (error) {
    console.error("Invalid token:", error);
    ctx.cookies.set("token", "", { maxAge: 0 }); // Clear the token
  }

  return await next(); // Continue the middleware chain
};

export const insertToToken = (ctx:Context, user: { user_id: string }) => {
  const token = jwt.sign({ user_id: user.user_id }, SECRET_KEY, { expiresIn: "1h" });

  ctx.cookies.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });


  return token;
};

