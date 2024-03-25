import { AlertType, DayOfWeek } from '@prisma/client';
import { z } from 'zod';

const intervalAlertSchema = z.object({
  alertType: z.literal(AlertType.INTERVAL),
  hours: z.number({ required_error: 'field hour is required' }),
  minutes: z.number({ required_error: 'field minute is required' }),
});

const dateAlertSchema = z.object({
  alertType: z.literal(AlertType.DATE),
  date: z.coerce
    .date({ required_error: 'field date is required' })
    .transform((dateString, ctx) => {
      const date = new Date(dateString);
      if (!z.date().safeParse(date).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
        });
      }
      return date;
    }),
});

const weeklyAlertSchema = z.object({
  alertType: z.literal(AlertType.WEEKLY),
  hours: z.number({ required_error: 'field hour is required' }),
  minutes: z.number({ required_error: 'field minute is required' }),
  date: z.coerce
    .date({ required_error: 'field date is required' })
    .transform((dateString, ctx) => {
      const date = new Date(dateString);
      if (!z.date().safeParse(date).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
        });
      }
      return date;
    }),
  week: z
    .nativeEnum(DayOfWeek, { required_error: 'field week is required' })
    .array()
    .min(1, { message: 'field week at least 1 element' }),
});

const dailyAlertSchema = z.object({
  alertType: z.literal(AlertType.DAILY),
  hours: z.number({ required_error: 'field hour is required' }),
  minutes: z.number({ required_error: 'field minute is required' }),
});

export const createAlertValidationSchema = z.object({
  title: z.string({
    required_error: 'field title is required',
  }),
  subtitle: z.string({ required_error: 'field subtitle is required' }),
  body: z.string({ required_error: 'field subtitle is required' }),
  // unit_of_measurement: z.nativeEnum(unitOfMeasurament, {
  //   required_error: 'field unit_of_measurement is required',
  // }),
  // medicine_id: z.string({ required_error: 'field medicine_id is required' }),
  trigger: z.discriminatedUnion(
    'alertType',
    [intervalAlertSchema, dateAlertSchema, weeklyAlertSchema, dailyAlertSchema],
    {
      required_error: 'field trigger is required',
    },
  ),
});

export type CreateAlertDtoType = z.infer<typeof createAlertValidationSchema>;
