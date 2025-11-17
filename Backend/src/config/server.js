import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "../routes/Auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const frontend = process.env.FRONTEND_URL
app.use(
    cors({
        origin: frontend,
        credentials: true,
    })
);

app.use("/auth", authRoutes);

export default app;