import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { sendError, sendSuccess } from '../utils/api-response';
import { isBeforeTodayLocal, parseLocalDateOnly } from '../utils/date';
import { dayQuerySchema } from '../validators/day.validator';

type DayHabitStatus = 'DONE' | 'MISSED' | 'SKIPPED' | 'PENDING';

export async function getDayStatus(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { date } = dayQuerySchema.parse(req.query);
    const normalizedDate = parseLocalDateOnly(date);

    if (!normalizedDate) {
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
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    sendError(res, 500, 'Internal server error.');
  }
}
