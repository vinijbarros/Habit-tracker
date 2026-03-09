import { Router } from 'express';
import {
  checkHabit,
  createHabit,
  listActiveHabits,
  softDeleteHabit,
  updateHabit,
} from '../controllers/habits.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', listActiveHabits);
router.post('/', createHabit);
router.post('/:id/check', checkHabit);
router.put('/:id', updateHabit);
router.delete('/:id', softDeleteHabit);

export { router as habitsRoutes };
