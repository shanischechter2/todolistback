import Koa from "koa";
import Router from "@koa/router";
import koaBody from "koa-body";
const cors = require("@koa/cors");
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import koaJwt from "koa-jwt";




dotenv.config();

const SECRET_KEY = "shani";
const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT),
});



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
    ctx.state.user = decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    ctx.cookies.set("token", "", { maxAge: 0 }); 
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
    const resultusername = await pool.query("SELECT * FROM users WHERE username = $1 ", [username]);
    if(resultusername.rows.length>0)
    {
         ctx.body = { error: "the username is allready in use another user" };
         ctx.status = 400;
         return;
    }
    const resultuseremail = await pool.query("SELECT * FROM users WHERE email = $1 ", [email]);
    if(resultuseremail.rows.length>0)
    {
         ctx.body = { error: "the email is allready in use by another user" };
         ctx.status = 400;
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
    if (result.rows.length === 0) {
      ctx.status = 401;
      ctx.body = { error: "Invalid email or password" };
      return;
    }

    const user = result.rows[0];

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


    ctx.body = { message: "Login successful", token };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.get("/users", async (ctx) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    ctx.body = result.rows;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});

router.post("/addtask", async (ctx) => {
  try {
    const { taskbody, timeOut } = ctx.request.body;
    if (!taskbody) {
      ctx.status = 400;
      ctx.body = { error: "All fields are required" };
      return;
    }
    console.log(timeOut);
    const Timeo2 = new Date(timeOut);
    console.log(Timeo2);


    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: No user ID found in token" };
      return;
    }
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

     const formattedTimeout = Timeo2.toISOString();
     const now = new Date().toISOString();
    const result = await pool.query(
      "INSERT INTO tasks (user_id, taskbody,TimeCreated,TimeOut,IsComplete,IsRelevant) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, taskbody, now, formattedTimeout, false, true]

    );
    ctx.status = 201;
    ctx.body = result;
    return result;
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
      ctx.body = { error: "Unauthorized: No user ID found in token " };
      return;
    }
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1 ", [userId]);
    ctx.body = result.rows[0];
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.get("/getalltasksbyuser", async (ctx) => {
  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized: No user ID found in token " };
      return;
    }
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY timecreated DESC", [userId]);
 
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

    ctx.body = result.rows;
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.put("/updatrelevant/:task_id/:isrelevant", async (ctx) => {
  try {
    
  const { task_id, isrelevant } = ctx.params;
  const isRelevantBool = isrelevant === "true"; 

  const result = await pool.query( "UPDATE tasks SET isrelevant = $2 WHERE task_id = $1 RETURNING *", [task_id, isRelevantBool]);


    if (result.rowCount === 0) {
      ctx.status = 404;
      ctx.body = JSON.stringify({ error: "Task not found" }); 
      return;
    }
    ctx.body = JSON.stringify(result.rows);
    
  } catch (error) {
    console.error("Error updating relevance:", error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});
router.delete("/deletetask/:task_id", async (ctx) => {
  try {
    const { task_id } = ctx.params;
    const result = await pool.query("DELETE FROM tasks WHERE task_id = $1 ", [task_id]);

    ctx.body = result.rows;


  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = { error: "Internal Server Error" };
  }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));