import sequelize from '../config/db.js';

export async function testConnection(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("Conexão com o banco de dados foi bem-sucedida!");

      await sequelize.sync();
      return;
    } catch (error) {
      console.error(`Tentativa ${i} falhou: ${error.message}`);
      if (i === retries) {
        console.error("Todas as tentativas de conexão falharam. Encerrando...");
        process.exit(1);
      }
      console.log(`Tentando novamente em ${delay / 1000} segundos...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
