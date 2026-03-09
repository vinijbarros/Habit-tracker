import { Router } from 'express';
import { getDayStatus } from '../controllers/day.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getDayStatus);

export { router as dayRoutes };
