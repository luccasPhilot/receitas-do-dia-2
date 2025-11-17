// Rode este script uma vez para inserir um user no banco
// com a senha criptografada.

import "dotenv/config";
import bcrypt from "bcrypt";
import { User } from "./src/models/UserModel.js";
import sequelize from "./src/config/db.js";

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const senhaHash = await bcrypt.hash("1234", 10);

        const novoUser = await User.create({
            email: "user@email.com",
            password: senhaHash,
        });

        console.log("Usuário criado com sucesso!");
        console.log("ID:", novoUser.id);
        process.exit(0);

    } catch (err) {
        console.error("Erro ao criar usuário:");
        console.error(err);
        process.exit(1);
    }
})();
