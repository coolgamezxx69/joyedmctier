import { Router } from "express";
import pool from "../lib/mysql";

const MODES = ["sword", "axe", "dpot", "nethpot", "smp", "crystal", "mace", "uhc"] as const;

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

router.get("/player/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const [playerRows] = await pool.execute<any[]>(
      "SELECT uuid, username, COALESCE(region, 'US') AS region FROM players WHERE username = ? LIMIT 1",
      [username]
    );

    if (!playerRows.length) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const player = playerRows[0];
    const uuid = player.uuid;

    const [statsRows] = await pool.execute<any[]>(
      `SELECT ps.mode, ps.mmr,
              COALESCE(ps.wins, 0) AS wins,
              COALESCE(ps.losses, 0) AS losses,
              COALESCE(ps.fights, 0) AS fights
       FROM player_stats ps
       WHERE ps.uuid = ?`,
      [uuid]
    );

    const [ht1Rows] = await pool.execute<any[]>(
      "SELECT mode FROM ht1_holders WHERE uuid = ?",
      [uuid]
    );
    const ht1modes = new Set(ht1Rows.map((r: any) => r.mode));

    const modes: Record<string, any> = {};
    let totalMMR = 0;
    let totalWins = 0;
    let totalLosses = 0;

    for (const row of statsRows) {
      const mmr = Number(row.mmr ?? 1000);
      const wins = Number(row.wins ?? 0);
      const losses = Number(row.losses ?? 0);
      const fights = Number(row.fights ?? 0);
      const isHT1 = ht1modes.has(row.mode);
      const placed = fights >= 10;

      modes[row.mode] = {
        mmr,
        wins,
        losses,
        fights,
        tier: isHT1 ? "HT1" : placed ? tierFromMMR(mmr) : "Unranked",
        isHT1,
        progress: isHT1 ? 100 : tierProgress(mmr),
        placed,
      };

      if (placed) {
        totalMMR += mmr;
        totalWins += wins;
        totalLosses += losses;
      }
    }

    res.json({
      uuid,
      username: player.username,
      region: player.region ?? "US",
      modes,
      totalMMR,
      totalWins,
      totalLosses,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get player profile");
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

export default router;
