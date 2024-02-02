import { AlertType } from '@prisma/client';
import { z } from 'zod';

const IntervalAlertSchema = z.object({
  type: z.literal(AlertType.INTERVAL),
  minute: z.number({ required_error: 'field minute is required' }),
});

const DateAlertSchema = z.object({
  type: z.literal(AlertType.DATE),
  date: z.date({ required_error: 'field date is required' }),
});

export const createAlertValidationSchema = z.object({
  title: z.string({
    required_error: 'field title is required',
  }),
  subtitle: z.string().min(1, { message: 'field subtitle is required' }),
  body: z.string().min(1, { message: 'field subtitle is required' }),
  medicine_id: z.string().min(1, { message: 'field subtitle is required' }),
  trigger: z.union([IntervalAlertSchema, DateAlertSchema], {}),
});

export type createAlertDto = z.infer<typeof createAlertValidationSchema>;
