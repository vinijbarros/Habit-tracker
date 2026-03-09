import { Router } from 'express';
import { getWeekSummary } from '../controllers/summary.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.get('/week', getWeekSummary);

export { router as summaryRoutes };
