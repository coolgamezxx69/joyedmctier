/**
 * Sub leaderboard APIs for sub tiers.
 */
import { Router } from "express";
import pool from "../lib/mysql";

const SUB_MODES = [
  "cartpvp", "speed", "bow", "creeper",
  "trident", "elytra", "diamondsmp", "diamondvanilla",
] as const;
type SubMode = (typeof SUB_MODES)[number];

const SUB_MODE_ORDER = [...SUB_MODES];

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

function pointsFromTier(tier: string): number {
  const map: Record<string, number> = {
    HT1: 60, LT1: 45, HT2: 30, LT2: 20,
    HT3: 10, LT3: 6, HT4: 4, LT4: 3,
    HT5: 2, LT5: 1, Unranked: 0,
  };
  return map[tier] ?? 0;
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

router.get("/sub-leaderboard/overview", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  try {
    const [rows] = await pool.execute<any[]>(
      `SELECT p.uuid, p.username, COALESCE(p.region, 'US') AS region,
              ss.mode, ss.mmr,
              COALESCE(ss.wins, 0) AS wins,
              COALESCE(ss.losses, 0) AS losses,
              COALESCE(ss.fights, 0) AS fights,
              CASE WHEN sh.uuid IS NOT NULL THEN 1 ELSE 0 END AS isHT1
       FROM players p
       JOIN sub_stats ss ON p.uuid = ss.uuid
       LEFT JOIN sub_ht1_holders sh ON sh.mode = ss.mode AND sh.uuid = ss.uuid
       WHERE ss.fights >= 10 AND ss.mmr >= 500`,
    );

    const playerMap = new Map<string, {
      uuid: string; username: string; region: string;
      totalMMR: number; totalPoints: number;
      rankedModes: number; totalWins: number; totalLosses: number;
      modes: { mode: string; tier: string; isHT1: boolean }[];
    }>();

    for (const r of rows as any[]) {
      if (!playerMap.has(r.uuid)) {
        playerMap.set(r.uuid, {
          uuid: r.uuid,
          username: r.username,
          region: r.region ?? "US",
          totalMMR: 0,
          totalPoints: 0,
          rankedModes: 0,
          totalWins: 0,
          totalLosses: 0,
          modes: [],
        });
      }
      const p = playerMap.get(r.uuid)!;
      const mmr = Number(r.mmr ?? 0);
      const isHT1 = Boolean(r.isHT1);
      const tier = isHT1 ? "HT1" : tierFromMMR(mmr);
      p.totalMMR += mmr;
      p.totalPoints += pointsFromTier(tier);
      p.rankedModes += 1;
      p.totalWins += Number(r.wins ?? 0);
      p.totalLosses += Number(r.losses ?? 0);
      p.modes.push({ mode: r.mode, tier, isHT1 });
    }

    const entries = [...playerMap.values()]
      .sort((a, b) => b.totalPoints - a.totalPoints || b.totalMMR - a.totalMMR)
      .slice(0, limit)
      .map((p) => ({
        uuid: p.uuid,
        username: p.username,
        region: p.region,
        totalMMR: p.totalMMR,
        totalPoints: p.totalPoints,
        rankedModes: p.rankedModes,
        totalWins: p.totalWins,
        totalLosses: p.totalLosses,
        modes: p.modes.sort((a, b) => SUB_MODE_ORDER.indexOf(a.mode as SubMode) - SUB_MODE_ORDER.indexOf(b.mode as SubMode)),
      }));

    res.json({ entries });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to get sub overview leaderboard");
    res.status(500).json({ error: "Failed to fetch sub leaderboard" });
  }
});

router.get("/sub-leaderboard/:mode", async (req, res) => {
  const { mode } = req.params;
  if (!SUB_MODES.includes(mode as SubMode)) {
    res.status(400).json({ error: "Invalid sub mode" });
    return;
  }
  const limit = Math.min(Number(req.query.limit ?? 50), 200);

  try {
    const [ht1Rows] = await pool.execute<any[]>(
      "SELECT uuid FROM sub_ht1_holders WHERE mode = ?",
      [mode],
    );
    const ht1uuid: string | null = ht1Rows[0]?.uuid ?? null;

    const [rows] = await pool.execute<any[]>(
      `SELECT p.uuid, p.username, COALESCE(p.region, 'US') AS region,
              ss.mmr,
              COALESCE(ss.wins, 0) AS wins,
              COALESCE(ss.losses, 0) AS losses,
              COALESCE(ss.fights, 0) AS fights
       FROM players p
       JOIN sub_stats ss ON p.uuid = ss.uuid
       WHERE ss.mode = ? AND ss.fights >= 10 AND ss.mmr >= 500
       ORDER BY ss.mmr DESC
       LIMIT ?`,
      [mode, limit],
    );

    const entries = (rows as any[]).map((r, i) => {
      const mmr = Number(r.mmr ?? 0);
      const isHT1 = r.uuid === ht1uuid;
      const tier = isHT1 ? "HT1" : tierFromMMR(mmr);
      return {
        rank: i + 1,
        uuid: r.uuid,
        username: r.username,
        region: r.region ?? "US",
        mmr,
        points: pointsFromTier(tier),
        wins: Number(r.wins ?? 0),
        losses: Number(r.losses ?? 0),
        fights: Number(r.fights ?? 0),
        tier,
        isHT1,
        progress: isHT1 ? 100 : tierProgress(mmr),
      };
    });

    res.json({ mode, entries });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to get sub leaderboard");
    res.status(500).json({ error: "Failed to fetch sub leaderboard" });
  }
});

export default router;
