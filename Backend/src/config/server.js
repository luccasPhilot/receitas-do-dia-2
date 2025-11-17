import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

import authRoutes from "../routes/Auth.routes.js";
import recipeRoutes from "../routes/Recipe.routes.js";

const app = express();
app.use(compression());
app.use(morgan("dev"));

app.use(express.json());
app.use(cookieParser());

const frontend = process.env.FRONTEND_URL;
app.use(
    cors({
        origin: frontend,
        credentials: true,
    })
);

app.use("/auth", authRoutes);
app.use("/recipes", recipeRoutes);

export default app;