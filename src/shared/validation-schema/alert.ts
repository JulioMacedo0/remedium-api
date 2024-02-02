import { AlertType, unitOfMeasurament } from '@prisma/client';
import { z } from 'zod';

const IntervalAlertSchema = z.object({
  type: z.literal(AlertType.INTERVAL),
  hour: z.number({ required_error: 'field hour is required' }),
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
  subtitle: z.string({ required_error: 'field subtitle is required' }),
  body: z.string({ required_error: 'field subtitle is required' }),
  unit_of_measurement: z.nativeEnum(unitOfMeasurament, {
    required_error: 'field unit_of_measurement is required',
  }),
  medicine_id: z.string({ required_error: 'field medicine_id is required' }),
  trigger: z.union([IntervalAlertSchema, DateAlertSchema], {
    required_error: 'field trigger is required',
  }),
});

export type createAlertDto = z.infer<typeof createAlertValidationSchema>;
