import { z } from 'zod';
import { parseLocalDateOnly } from '../utils/date';

const dateSchema = (label: 'start' | 'end') =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be in YYYY-MM-DD format.`)
    .refine((value) => parseLocalDateOnly(value) !== null, `${label} is invalid.`);

export const weekSummaryQuerySchema = z
  .object({
    start: dateSchema('start'),
    end: dateSchema('end').optional(),
  })
  .superRefine((value, ctx) => {
    const startDate = parseLocalDateOnly(value.start);
    const endDate = value.end ? parseLocalDateOnly(value.end) : null;

    if (!startDate || !endDate) {
      return;
    }

    if (endDate.getTime() < startDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'end must be greater than or equal to start.',
        path: ['end'],
      });
      return;
    }

    const diffInDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);

    if (diffInDays > 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The selected range can include at most 7 days.',
        path: ['end'],
      });
    }
  });
