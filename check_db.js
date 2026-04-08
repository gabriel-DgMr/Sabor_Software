import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: "c:/Hexalogic/Proyects/Sabor/Sabor_Software/backend/.env",
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
};

async function checkDB() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to DB");

    const [tables] = await connection.query("SHOW TABLES");
    console.log(
      "Tables:",
      tables.map((t) => Object.values(t)[0]),
    );

    const [reservations] = await connection.query(
      "SELECT * FROM reservaciones ORDER BY fecha_creacion DESC LIMIT 5",
    );
    console.log("Recent Reservations:", JSON.stringify(reservations, null, 2));

    const [mesas] = await connection.query("SELECT * FROM mesas");
    console.log("Mesas:", JSON.stringify(mesas, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (connection) await connection.end();
  }
}

checkDB();
