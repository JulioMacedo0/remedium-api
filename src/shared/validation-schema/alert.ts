import { AlertType, DayOfWeek, unitOfMeasurament } from '@prisma/client';
import { z } from 'zod';

const intervalAlertSchema = z.object({
  type: z.literal(AlertType.INTERVAL),
  hour: z.number({ required_error: 'field hour is required' }),
  minute: z.number({ required_error: 'field minute is required' }),
});

const dateAlertSchema = z.object({
  type: z.literal(AlertType.DATE),
  date: z.date({ required_error: 'field date is required' }),
});

const weeklyAlertSchema = z.object({
  type: z.literal(AlertType.WEEKLY),
  hour: z.number({ required_error: 'field hour is required' }),
  minute: z.number({ required_error: 'field minute is required' }),
  week: z.nativeEnum(DayOfWeek).array(),
});

const dailyAlertSchema = z.object({
  type: z.literal(AlertType.DAILY),
  hour: z.number({ required_error: 'field hour is required' }),
  minute: z.number({ required_error: 'field minute is required' }),
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
  trigger: z.discriminatedUnion(
    'type',
    [intervalAlertSchema, dateAlertSchema, weeklyAlertSchema, dailyAlertSchema],
    {
      required_error: 'field trigger is required',
    },
  ),
});

export type createAlertDto = z.infer<typeof createAlertValidationSchema>;
