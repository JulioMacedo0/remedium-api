import { z } from 'zod';

export const medicineValidationSchema = z
  .object({
    name: z.string({
      required_error: 'field name is required medicine',
    }),
    quantity: z.number({
      required_error: 'field quantity is required',
    }),
  })
  .required();

export type medicineDto = z.infer<typeof medicineValidationSchema>;
