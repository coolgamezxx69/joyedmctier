import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaderboardRouter from "./leaderboard";
import playersRouter from "./players";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaderboardRouter);
router.use(playersRouter);

export default router;
