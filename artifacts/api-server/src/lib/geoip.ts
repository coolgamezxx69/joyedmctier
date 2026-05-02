import pool from "./mysql";
import { logger } from "./logger";

const EU_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
  "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES",
  "SE","GB","NO","CH","IS","LI","AL","BA","ME","MK","RS","XK",
]);

function isPrivateIP(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  );
}

async function lookupRegion(ip: string): Promise<"US" | "EU"> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json() as { countryCode?: string };
    return EU_CODES.has(data.countryCode ?? "") ? "EU" : "US";
  } catch {
    return "US";
  }
}

export async function processGeoQueue(): Promise<void> {
  try {
    const [rows] = await pool.execute<any[]>(
      `SELECT uuid, ip FROM players
       WHERE ip IS NOT NULL AND region_checked = 0
       LIMIT 10`
    );

    for (const row of rows as any[]) {
      if (!row.ip || isPrivateIP(row.ip)) {
        await pool.execute(
          "UPDATE players SET region_checked = 1 WHERE uuid = ?",
          [row.uuid]
        );
        continue;
      }

      const region = await lookupRegion(row.ip);
      await pool.execute(
        "UPDATE players SET region = ?, region_checked = 1 WHERE uuid = ?",
        [region, row.uuid]
      );
      logger.info({ uuid: row.uuid, region }, "Region detected via GeoIP");
    }
  } catch (err) {
    logger.warn({ err }, "GeoIP queue processing error");
  }
}

export function startGeoWorker(): void {
  // Process immediately on startup, then every 30 seconds
  processGeoQueue();
  setInterval(processGeoQueue, 5_000);
  logger.info("GeoIP worker started");
}
