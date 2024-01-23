import { z } from 'zod';

export const signInValidationSchema = z
  .object({
    email: z
      .string({ invalid_type_error: 'Email only accepts string values' })
      .min(1, 'Email dont be empty')
      .email(),
    password: z
      .string({
        invalid_type_error: 'Password only accepts string values',
      })
      .min(8, 'Password must contain at least 8 characters'),
  })
  .required();

export type signInDto = z.infer<typeof signInValidationSchema>;
