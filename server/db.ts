import pkg from "pg";
const { Pool } = pkg;

// создаём пул подключений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // обязательно для Render
});

// --- Функции работы с базой ---

// Создание таблиц
export async function createTables() {
  try {
    // Таблица groups
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);

    // Таблица people
    await pool.query(`
      CREATE TABLE IF NOT EXISTS people (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        group_id INT REFERENCES groups(id)
      );
    `);
  } catch (err) {
    console.error("Ошибка при создании таблиц:", err);
  }
}

// Добавление группы
export async function addGroup(name: string) {
  try {
    await pool.query("INSERT INTO groups (name) VALUES ($1)", [name]);
  } catch (err) {
    console.error("Ошибка при добавлении группы:", err);
  }
}

// Получение всех групп
export async function fetchGroups() {
  try {
    const res = await pool.query("SELECT * FROM groups ORDER BY id");
    return res.rows;
  } catch (err) {
    console.error("Ошибка при получении групп:", err);
    return [];
  }
}

// Добавление человека
export async function addPerson(name: string, group_id: number) {
  try {
    await pool.query("INSERT INTO people (name, group_id) VALUES ($1, $2)", [
      name,
      group_id,
    ]);
  } catch (err) {
    console.error("Ошибка при добавлении человека:", err);
  }
}

// Получение всех людей
export async function fetchPeople() {
  try {
    const res = await pool.query("SELECT * FROM people ORDER BY id");
    return res.rows;
  } catch (err) {
    console.error("Ошибка при получении людей:", err);
    return [];
  }
}

// Закрытие пула
export async function closePool() {
  await pool.end();
}
