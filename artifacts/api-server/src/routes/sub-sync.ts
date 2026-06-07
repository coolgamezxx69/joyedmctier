/**
 * POST /api/sub-sync/stats   — upsert a player's sub-duel stats from Skript
 * POST /api/sub-sync/ht1     — update HT1 holder for a sub mode
 *
 * Both endpoints require the X-Sync-Secret header to match the SYNC_SECRET
 * env variable, keeping your endpoint private from randoms.
 */
import { Router } from "express";
import pool from "../lib/mysql";

const router = Router();
const SYNC_SECRET = process.env.SYNC_SECRET ?? "";

function authCheck(req: any, res: any): boolean {
  if (!SYNC_SECRET) return true; // dev: no secret set → allow
  if (req.headers["x-sync-secret"] !== SYNC_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

const SUB_MODES = new Set([
  "cartpvp", "speed", "bow", "creeper",
  "trident", "elytra", "diamondsmp", "diamondvanilla",
]);

router.post("/sub-sync/stats", async (req, res) => {
  if (!authCheck(req, res)) return;
  const { uuid, mode, mmr, wins, losses, fights } = req.body ?? {};
  if (!uuid || !mode || !SUB_MODES.has(mode)) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  try {
    await pool.execute(
      `INSERT INTO sub_stats (uuid, mode, mmr, wins, losses, fights, last_fight)
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         mmr = VALUES(mmr),
         wins = VALUES(wins),
         losses = VALUES(losses),
         fights = VALUES(fights),
         last_fight = NOW()`,
      [uuid, mode, Number(mmr ?? 1000), Number(wins ?? 0), Number(losses ?? 0), Number(fights ?? 0)],
    );
    res.json({ ok: true });
  } catch (err) {
    req.log?.error?.({ err }, "sub-sync/stats failed");
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/sub-sync/ht1", async (req, res) => {
  if (!authCheck(req, res)) return;
  const { uuid, mode } = req.body ?? {};
  if (!uuid || !mode || !SUB_MODES.has(mode)) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  try {
    await pool.execute(
      `INSERT INTO sub_ht1_holders (mode, uuid) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE uuid = VALUES(uuid)`,
      [mode, uuid],
    );
    res.json({ ok: true });
  } catch (err) {
    req.log?.error?.({ err }, "sub-sync/ht1 failed");
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
