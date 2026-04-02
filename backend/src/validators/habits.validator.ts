import { z } from 'zod';

export const habitIdParamsSchema = z.object({
  id: z.string().uuid('Habit id must be a valid UUID.'),
});

export const createHabitBodySchema = z.object({
  title: z.string().trim().min(1, 'title is required.').max(120, 'title is too long.'),
  frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']),
  weeklyTarget: z.number().int('weeklyTarget must be an integer.').positive().nullable().optional(),
  customFrequencyCount: z
    .number()
    .int('customFrequencyCount must be an integer.')
    .positive()
    .nullable()
    .optional(),
  customFrequencyPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).nullable().optional(),
  points: z.number().int('points must be an integer.').positive().optional(),
}).superRefine((data, context) => {
  if (data.frequencyType === 'CUSTOM') {
    if (!data.customFrequencyCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'customFrequencyCount is required for CUSTOM frequency.',
        path: ['customFrequencyCount'],
      });
    }

    if (!data.customFrequencyPeriod) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'customFrequencyPeriod is required for CUSTOM frequency.',
        path: ['customFrequencyPeriod'],
      });
    }
  }
});

export const updateHabitBodySchema = z
  .object({
    title: z.string().trim().min(1, 'title cannot be empty.').max(120, 'title is too long.').optional(),
    frequencyType: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
    weeklyTarget: z.number().int('weeklyTarget must be an integer.').positive().nullable().optional(),
    customFrequencyCount: z
      .number()
      .int('customFrequencyCount must be an integer.')
      .positive()
      .nullable()
      .optional(),
    customFrequencyPeriod: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).nullable().optional(),
    points: z.number().int('points must be an integer.').positive().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  })
  .superRefine((data, context) => {
    if (data.frequencyType === 'CUSTOM') {
      if (!data.customFrequencyCount) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'customFrequencyCount is required for CUSTOM frequency.',
          path: ['customFrequencyCount'],
        });
      }

      if (!data.customFrequencyPeriod) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'customFrequencyPeriod is required for CUSTOM frequency.',
          path: ['customFrequencyPeriod'],
        });
      }
    }
  });
