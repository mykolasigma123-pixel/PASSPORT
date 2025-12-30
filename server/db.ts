// dt.ts
import pkg from "pg";
const { Pool } = pkg;

// создаём пул подключений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // обязательно для Render
});

// функция для создания таблицы groups
async function createGroupsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
    console.log("Таблица groups успешно создана!");
  } catch (err) {
    console.error("Ошибка подключения или создания таблицы:", err);
  } finally {
    await pool.end(); // закрываем пул
  }
}

// запускаем функцию
createGroupsTable();
