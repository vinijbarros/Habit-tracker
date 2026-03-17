import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { sendError, sendSuccess } from '../utils/api-response';
import { parseLocalDateOnly } from '../utils/date';
import { debugError, debugLog } from '../utils/debug';
import { habitCheckBodySchema } from '../validators/day.validator';
import {
  createHabitBodySchema,
  habitIdParamsSchema,
  updateHabitBodySchema,
} from '../validators/habits.validator';

export async function listActiveHabits(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('HABITS', 'List habits blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    debugLog('HABITS', 'Listing active habits', { userId: req.userId });
    const habits = await prisma.habit.findMany({
      where: {
        userId: req.userId,
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, 200, { habits });
  } catch (error) {
    debugError('HABITS', 'List habits failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}

export async function createHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('HABITS', 'Create habit blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { title, frequencyType, weeklyTarget } = createHabitBodySchema.parse(req.body);
    debugLog('HABITS', 'Creating habit', { userId: req.userId, title, frequencyType });

    const habit = await prisma.habit.create({
      data: {
        userId: req.userId,
        title,
        frequencyType,
        weeklyTarget: weeklyTarget ?? null,
      },
    });

    sendSuccess(res, 201, { habit });
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('HABITS', 'Create habit validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('HABITS', 'Create habit failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}

export async function updateHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('HABITS', 'Update habit blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);
    const payload = updateHabitBodySchema.parse(req.body);
    debugLog('HABITS', 'Updating habit', { userId: req.userId, habitId: id, payload });

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingHabit) {
      debugLog('HABITS', 'Update habit not found', { userId: req.userId, habitId: id });
      sendError(res, 404, 'Habit not found.');
      return;
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: payload,
    });

    sendSuccess(res, 200, { habit });
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('HABITS', 'Update habit validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('HABITS', 'Update habit failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}

export async function softDeleteHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('HABITS', 'Delete habit blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);
    debugLog('HABITS', 'Soft deleting habit', { userId: req.userId, habitId: id });

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingHabit) {
      debugLog('HABITS', 'Delete habit not found', { userId: req.userId, habitId: id });
      sendError(res, 404, 'Habit not found.');
      return;
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        active: false,
      },
    });

    sendSuccess(res, 200, { habit });
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('HABITS', 'Delete habit validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('HABITS', 'Delete habit failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}

export async function checkHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    debugLog('HABITS', 'Check habit blocked: missing userId');
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);
    const { date, status } = habitCheckBodySchema.parse(req.body);
    const normalizedDate = parseLocalDateOnly(date);
    debugLog('HABITS', 'Habit check-in request', {
      userId: req.userId,
      habitId: id,
      date,
      status,
    });

    if (!normalizedDate) {
      debugLog('HABITS', 'Check habit invalid date', { habitId: id, date });
      sendError(res, 400, 'Invalid date.');
      return;
    }

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      select: {
        id: true,
        active: true,
      },
    });

    if (!habit) {
      debugLog('HABITS', 'Check habit not found', { userId: req.userId, habitId: id });
      sendError(res, 404, 'Habit not found.');
      return;
    }

    if (!habit.active) {
      debugLog('HABITS', 'Check habit rejected: inactive habit', { habitId: id });
      sendError(res, 400, 'Cannot check-in an inactive habit.');
      return;
    }

    const habitLog = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId: id,
          date: normalizedDate,
        },
      },
      create: {
        habitId: id,
        date: normalizedDate,
        status,
      },
      update: {
        status,
      },
    });

    sendSuccess(res, 200, { habitLog });
  } catch (error) {
    if (error instanceof ZodError) {
      debugLog('HABITS', 'Check habit validation failed', error.flatten());
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    debugError('HABITS', 'Check habit failed', error);
    sendError(res, 500, 'Internal server error.');
  }
}
