import Koa from "koa";
import Router from "@koa/router";
import koaBody from "koa-body";
const cors = require("@koa/cors");
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import koaJwt from "koa-jwt";

// Change this to a secure secret


dotenv.config();

const SECRET_KEY = "shani";
const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 5000;

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});

// Middleware

app.use(koaBody());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(async (ctx, next) => {
  const token = ctx.cookies.get("token");

  if (!token) {
    console.warn("No token found in cookies.");
    return await next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    //console.log("Decoded token:", decoded); // Debugging log
    ctx.state.user = decoded; // ✅ Store user info in ctx.state
  } catch (error) {
    console.error("Invalid token:", error);
    ctx.cookies.set("token", "", { maxAge: 0 }); // Clear invalid token
  }

  await next();
});
app.use(router.routes()).use(router.allowedMethods());


router.post("/signup", async (ctx) => {
  try {
    const { username, email, password } = ctx.request.body;
    if (!username || !email || !password) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
    const result = await pool.query(
      "INSERT INTO users (username, email, pass) VALUES ($1, $2, $3) RETURNING user_id, username, email",
      [username, email, password]
    );

    ctx.body = { message: "User registered successfully", user: result.rows[0] };
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.post("/login", async (ctx) => {
  try {
    const { email, password } = ctx.request.body;
    if (!email || !password) {
      ctx.status = 400;
      ctx.body = { error: "Email and password are required" };
      return;
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    //console.log(result);
    if (result.rows.length === 0) {
      ctx.status = 401;
      ctx.body = { error: "Invalid email or password" };
      return;
    }

    const user = result.rows[0];
    // console.log(user);

    // console.log(user.pass);
    // console.log(password);

    if (password !== user.pass) {
      ctx.status = 401;
      ctx.body = { error: "Invalid email or password" };
      return;
    }


    const token = jwt.sign({ id: user.user_id }, SECRET_KEY, { expiresIn: "1h" });
    ctx.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    //   console.log(token);

    ctx.body = { message: "Login successful", token };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.get("/users", async (ctx) => {
  try {
    //ORDER BY TimeCreated DESC
    const result = await pool.query("SELECT * FROM users");
    ctx.body = result.rows;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.post("/addtask", async (ctx) => {
  // console.log("sssss")
  //console.log("POST /addtask called");
  try {
    const { taskbody, TimeOut } = ctx.request.body;
    if (!taskbody || !TimeOut) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
    // console.log(TimeOut);
    const Timeo2 = new Date(TimeOut);
    // console.log(Timeo2);


    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: No user ID found in token" };
      return;
    }
    const formattedTimeout = Timeo2.toISOString().replace("T", " ").replace("Z", "");
    const now = new Date().toISOString().replace("T", " ").replace("Z", "");


    const result = await pool.query(
      "INSERT INTO tasks (user_id, taskbody,TimeCreated,TimeOut,IsComplete,IsRelevant) VALUES ($1, $2, $3, $4, $5, $6) RETURNING taskbody",
      [userId, taskbody, now, formattedTimeout, false, false]

    );
    ctx.status = 201;
    ctx.body = { message: "Task added successfully" };

  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.get("/getusername", async (ctx) => {
  try {

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: No user ID found in token" };
      return;
    }
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    //return result;
    ctx.body = result.rows[0];
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.get("/getalltasksbyuser", async (ctx) => {
  try {
    //ORDER BY TimeCreated DESC
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: No user ID found in token " };
      return;
    }
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY TimeCreated DESC", [userId]);
    //return result;
    ctx.body = result.rows;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.put("/updatecheck/:task_id/:iscom", async (ctx) => {
  try {
    
  const { task_id,iscom } = ctx.params;
  const result = await pool.query(  "UPDATE tasks SET IsComplete = $2 WHERE task_id = $1", [task_id,iscom]);
    //return result;
    ctx.body = result.rows;
    console.log(iscom);
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.delete("/deletetask/:task_id", async (ctx) => {
  try {
    const { task_id } = ctx.params;

    // console.log(task_id);

    const result = await pool.query("DELETE FROM tasks WHERE task_id = $1 ", [task_id]);
    //return result;
    ctx.body = result.rows;
    console.log(result)

  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));