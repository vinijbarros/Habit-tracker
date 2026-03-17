import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { sendError, sendSuccess } from '../utils/api-response';
import { isBeforeTodayLocal, parseLocalDateOnly } from '../utils/date';
import { debugError, debugLog } from '../utils/debug';
import { dayQuerySchema } from '../validators/day.validator';

type DayHabitStatus = 'DONE' | 'MISSED' | 'SKIPPED' | 'PENDING';

export async function getDayStatus(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('DAY', 'Day summary blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { date } = dayQuerySchema.parse(req.query);
    const normalizedDate = parseLocalDateOnly(date);
    debugLog('DAY', 'Fetching day status', { userId: req.userId, date });

    if (!normalizedDate) {
      debugLog('DAY', 'Day summary invalid date', { date });
      sendError(res, 400, 'Invalid date.');
      return;
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: req.userId,
        active: true,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const logs = habits.length
      ? await prisma.habitLog.findMany({
          where: {
            habitId: {
              in: habits.map((habit) => habit.id),
            },
            date: normalizedDate,
          },
          select: {
            habitId: true,
            status: true,
          },
        })
      : [];

    const logByHabitId = new Map(logs.map((log) => [log.habitId, log.status]));

    const day = habits.map((habit) => {
      const loggedStatus = logByHabitId.get(habit.id);
      let status: DayHabitStatus;

      if (loggedStatus) {
        status = loggedStatus;
      } else {
        status = isBeforeTodayLocal(normalizedDate) ? 'MISSED' : 'PENDING';
      }

      return {
        habitId: habit.id,
        title: habit.title,
        status,
      };
    });

    sendSuccess(res, 200, day);
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('DAY', 'Day summary validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('DAY', 'Day summary failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}
