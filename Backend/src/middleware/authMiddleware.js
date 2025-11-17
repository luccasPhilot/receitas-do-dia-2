import jwt from "jsonwebtoken";
import { getUserById } from "../services/AdminService.js";

const SECRET = process.env.SECRET;

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, async (error, decoded) => {
      if (error) {
        return res.status(401).send({ message: "Token inválido" });
      }

      const admin = await getUserById(decoded.id);
      if (!admin)
        return res.status(404).send({ message: "Usuário não encontrado" });

      req.userId = admin.id;
      return next();
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
