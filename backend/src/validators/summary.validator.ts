import { z } from 'zod';
import { isMondayLocal, parseLocalDateOnly } from '../utils/date';

const startDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'start must be in YYYY-MM-DD format.')
  .refine((value) => parseLocalDateOnly(value) !== null, 'start is invalid.')
  .refine((value) => {
    const date = parseLocalDateOnly(value);
    return date ? isMondayLocal(date) : false;
  }, 'start must be a Monday.');

export const weekSummaryQuerySchema = z.object({
  start: startDateSchema,
});
