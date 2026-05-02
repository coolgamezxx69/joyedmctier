import pool from "./mysql";
import { logger } from "./logger";

const migrations = [
  `ALTER TABLE player_stats ADD COLUMN wins INT NOT NULL DEFAULT 0`,
  `ALTER TABLE player_stats ADD COLUMN losses INT NOT NULL DEFAULT 0`,
  `ALTER TABLE players ADD COLUMN region VARCHAR(4) NOT NULL DEFAULT 'US'`,
  `ALTER TABLE players ADD COLUMN ip VARCHAR(45) DEFAULT NULL`,
  `ALTER TABLE players ADD COLUMN region_checked TINYINT(1) NOT NULL DEFAULT 0`,
  `UPDATE players SET region = 'US' WHERE region NOT IN ('US', 'EU')`,
];

export async function runMigrations(): Promise<void> {
  for (const sql of migrations) {
    try {
      await pool.execute(sql);
      logger.info({ sql }, "Migration applied");
    } catch (err: any) {
      if (err?.code === "ER_DUP_FIELDNAME") {
        logger.debug({ sql }, "Column already exists, skipping");
      } else {
        logger.warn({ err, sql }, "Migration warning");
      }
    }
  }
}
