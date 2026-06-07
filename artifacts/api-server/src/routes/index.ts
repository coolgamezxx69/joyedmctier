import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaderboardRouter from "./leaderboard";
import playersRouter from "./players";
import subLeaderboardRouter from "./sub-leaderboard";
import subSyncRouter from "./sub-sync";
import geoipRouter from "./geoip";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaderboardRouter);
router.use(playersRouter);
router.use(subLeaderboardRouter);
router.use(subSyncRouter);
router.use(geoipRouter);

export default router;
