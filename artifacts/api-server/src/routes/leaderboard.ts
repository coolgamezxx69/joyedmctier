import { Router } from "express";
import pool from "../lib/mysql";

const MODES = ["sword", "axe", "dpot", "nethpot", "smp", "crystal", "mace", "uhc"] as const;
type Mode = (typeof MODES)[number];

function tierFromMMR(mmr: number): string {
  if (mmr < 500) return "LT5";
  if (mmr < 900) return "HT5";
  if (mmr < 1300) return "LT4";
  if (mmr < 1700) return "HT4";
  if (mmr < 2100) return "LT3";
  if (mmr < 2500) return "HT3";
  if (mmr < 2900) return "LT2";
  if (mmr < 3300) return "HT2";
  return "LT1";
}

function tierProgress(mmr: number): number {
  const brackets = [0, 500, 900, 1300, 1700, 2100, 2500, 2900, 3300, 3700];
  for (let i = brackets.length - 2; i >= 0; i--) {
    if (mmr >= brackets[i]) {
      const range = brackets[i + 1] - brackets[i];
      return Math.round(((mmr - brackets[i]) / range) * 100);
    }
  }
  return 0;
}

const router = Router();

// GET /api/leaderboard/overview — must come BEFORE /:mode
router.get("/leaderboard/overview", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 10), 100);
  try {
    const [rows] = await pool.execute<any[]>(
      `SELECT p.uuid, p.username,
              SUM(ps.mmr) AS totalMMR,
              COUNT(DISTINCT ps.mode) AS rankedModes,
              SUM(ps.fights) AS totalFights
       FROM players p
       JOIN player_stats ps ON p.uuid = ps.uuid
       WHERE ps.fights >= 10
       GROUP BY p.uuid, p.username
       ORDER BY totalMMR DESC
       LIMIT ?`,
      [limit]
    );

    const entries = rows.map((r: any, i: number) => ({
      rank: i + 1,
      uuid: r.uuid,
      username: r.username,
      totalMMR: Number(r.totalMMR ?? 0),
      rankedModes: Number(r.rankedModes ?? 0),
      totalWins: Number(r.totalFights ?? 0),
      totalLosses: 0,
    }));

    res.json({ entries });
  } catch (err) {
    req.log.error({ err }, "Failed to get overview leaderboard");
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/leaderboard/:mode
router.get("/leaderboard/:mode", async (req, res) => {
  const { mode } = req.params;
  if (!MODES.includes(mode as Mode)) {
    res.status(400).json({ error: "Invalid mode" });
    return;
  }
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  try {
    const [ht1Rows] = await pool.execute<any[]>(
      "SELECT uuid FROM ht1_holders WHERE mode = ?",
      [mode]
    );
    const ht1uuid: string | null = ht1Rows[0]?.uuid ?? null;

    const [rows] = await pool.execute<any[]>(
      `SELECT p.uuid, p.username, ps.mmr, ps.fights
       FROM players p
       JOIN player_stats ps ON p.uuid = ps.uuid
       WHERE ps.mode = ? AND ps.fights >= 10
       ORDER BY ps.mmr DESC
       LIMIT ?`,
      [mode, limit]
    );

    const entries = rows.map((r: any, i: number) => {
      const fights = Number(r.fights ?? 0);
      const mmr = Number(r.mmr ?? 1000);
      const isHT1 = r.uuid === ht1uuid;
      return {
        rank: i + 1,
        uuid: r.uuid,
        username: r.username,
        mmr,
        wins: fights,
        losses: 0,
        fights,
        tier: isHT1 ? "HT1" : tierFromMMR(mmr),
        isHT1,
        progress: isHT1 ? 100 : tierProgress(mmr),
      };
    });

    res.json({ mode, entries });
  } catch (err) {
    req.log.error({ err }, "Failed to get leaderboard");
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
