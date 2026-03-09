import { z } from 'zod';
import { parseLocalDateOnly } from '../utils/date';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format.')
  .refine((value) => parseLocalDateOnly(value) !== null, 'date is invalid.');

export const dayQuerySchema = z.object({
  date: dateStringSchema,
});

export const habitCheckBodySchema = z.object({
  date: dateStringSchema,
  status: z.enum(['DONE', 'MISSED', 'SKIPPED']),
});
