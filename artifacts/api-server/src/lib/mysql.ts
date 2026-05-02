import mysql from "mysql2/promise";
import { logger } from "./logger";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT ?? 3306),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

pool
  .getConnection()
  .then((conn) => {
    logger.info("MySQL connected");
    conn.release();
  })
  .catch((err) => {
    logger.error({ err }, "MySQL connection failed");
  });

export default pool;
