import { z } from 'zod';

export const habitIdParamsSchema = z.object({
  id: z.string().uuid('Habit id must be a valid UUID.'),
});

export const createHabitBodySchema = z.object({
  title: z.string().trim().min(1, 'title is required.').max(120, 'title is too long.'),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']),
  weeklyTarget: z.number().int('weeklyTarget must be an integer.').positive().nullable().optional(),
});

export const updateHabitBodySchema = z
  .object({
    title: z.string().trim().min(1, 'title cannot be empty.').max(120, 'title is too long.').optional(),
    frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
    weeklyTarget: z.number().int('weeklyTarget must be an integer.').positive().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });
