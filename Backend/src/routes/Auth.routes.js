import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { User } from "../models/UserModel.js";

const router = express.Router();
router.use(cookieParser());

const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION);
const JWT_SECRET = process.env.SECRET;

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha obrigatórios" });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: TOKEN_EXPIRATION,
        });

        res.status(200).json({
            message: "Autenticado com sucesso",
            expiresIn: `${TOKEN_EXPIRATION / 1000 / 60 / 60} hours`,
            token,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erro interno" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.json({ message: "Logout realizado" });
});

router.get("/validate", (req, res) => {
    const token = req.cookies.token;

    if (!token)
        return res.status(401).json({ valid: false, message: "Token ausente" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ valid: false, message: "Token inválido" });

        return res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email,
            },
        });
    });
});

export default router;
