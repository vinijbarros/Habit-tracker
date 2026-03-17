import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { sendError, sendSuccess } from '../utils/api-response';
import { addDaysLocal, formatDbDateOnly, formatLocalDateOnly, parseLocalDateOnly } from '../utils/date';
import { debugError, debugLog } from '../utils/debug';
import { weekSummaryQuerySchema } from '../validators/summary.validator';

type DayStatus = 'DONE' | 'MISSED' | 'SKIPPED' | 'PENDING';

export async function getWeekSummary(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('SUMMARY', 'Week summary blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { start, end } = weekSummaryQuerySchema.parse(req.query);
    const startDate = parseLocalDateOnly(start);
    debugLog('SUMMARY', 'Fetching week summary', { userId: req.userId, start, end });

    if (!startDate) {
      debugLog('SUMMARY', 'Week summary invalid start date', { start });
      sendError(res, 400, 'Invalid start date.');
      return;
    }

    const endDate = end ? parseLocalDateOnly(end) : addDaysLocal(startDate, 6);

    if (!endDate) {
      debugLog('SUMMARY', 'Week summary invalid end date', { end });
      sendError(res, 400, 'Invalid end date.');
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

    const habitIds = habits.map((habit) => habit.id);

    const logs = habitIds.length
      ? await prisma.habitLog.findMany({
          where: {
            habitId: { in: habitIds },
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            habitId: true,
            date: true,
            status: true,
          },
        })
      : [];

    const logMap = new Map<string, 'DONE' | 'MISSED' | 'SKIPPED'>();
    for (const log of logs) {
      logMap.set(`${log.habitId}:${formatDbDateOnly(log.date)}`, log.status);
    }

    const rangeLength =
      Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    const weekDates = Array.from({ length: rangeLength }, (_, index) => {
      const date = addDaysLocal(startDate, index);
      return {
        key: formatLocalDateOnly(date),
        date,
      };
    });

    const habitsSummary = habits.map((habit) => {
      const perDay = weekDates.map(({ key }): { date: string; status: DayStatus } => {
        const loggedStatus = logMap.get(`${habit.id}:${key}`);
        return {
          date: key,
          status: loggedStatus ?? 'PENDING',
        };
      });

      const doneCount = perDay.filter((item) => item.status === 'DONE').length;
      const missedCount = perDay.filter((item) => item.status === 'MISSED').length;
      const skippedCount = perDay.filter((item) => item.status === 'SKIPPED').length;

      return {
        habitId: habit.id,
        title: habit.title,
        doneCount,
        missedCount,
        skippedCount,
        perDay,
      };
    });

    sendSuccess(res, 200, {
      range: {
        start,
        end: formatLocalDateOnly(endDate),
      },
      habits: habitsSummary,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('SUMMARY', 'Week summary validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('SUMMARY', 'Week summary failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}
