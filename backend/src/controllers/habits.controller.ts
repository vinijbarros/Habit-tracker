import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { sendError, sendSuccess } from '../utils/api-response';
import { parseLocalDateOnly } from '../utils/date';
import { habitCheckBodySchema } from '../validators/day.validator';
import {
  createHabitBodySchema,
  habitIdParamsSchema,
  updateHabitBodySchema,
} from '../validators/habits.validator';

export async function listActiveHabits(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
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
  } catch {
    sendError(res, 500, 'Internal server error.');
  }
}

export async function createHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { title, frequencyType, weeklyTarget } = createHabitBodySchema.parse(req.body);

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
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    sendError(res, 500, 'Internal server error.');
  }
}

export async function updateHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);
    const payload = updateHabitBodySchema.parse(req.body);

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingHabit) {
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
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    sendError(res, 500, 'Internal server error.');
  }
}

export async function softDeleteHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingHabit) {
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
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    sendError(res, 500, 'Internal server error.');
  }
}

export async function checkHabit(req: Request, res: Response): Promise<void> {
  if (!req.userId) {
    sendError(res, 401, 'Unauthorized.');
    return;
  }

  try {
    const { id } = habitIdParamsSchema.parse(req.params);
    const { date, status } = habitCheckBodySchema.parse(req.body);
    const normalizedDate = parseLocalDateOnly(date);

    if (!normalizedDate) {
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
      sendError(res, 404, 'Habit not found.');
      return;
    }

    if (!habit.active) {
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
      sendError(res, 400, 'Validation error.', error.flatten());
      return;
    }

    sendError(res, 500, 'Internal server error.');
  }
}
