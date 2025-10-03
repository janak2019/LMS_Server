import express from "express";
import {config} from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import bookRouter from "./routes/bookRouter.js";
import borrowRouter from "./routes/borrowRouter.js";
import userRouter from "./routes/userRouter.js";
import fileUpload from "express-fileupload";
import path from "path";

export const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
config({path :"./config/config.env"});
app.use(
    cors({
    origin:['http://localhost:5173','https://lms-client-sooty.vercel.app'],
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer"); // or "origin", "same-origin", etc.
  next();
});
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/book",bookRouter);
app.use("/api/v1/borrow",borrowRouter);
app.use("/api/v1/user",userRouter);
connectDB()
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  fileUpload({
  useTempFiles: true,         // ✅ required
  tempFileDir: "/tmp/",       // ✅ temporary folder
  limits: { fileSize: 100*1024 }, // optional: 100KB max
}));


app.use(errorMiddleware)