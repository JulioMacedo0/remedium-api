import { z } from 'zod';

export const signInValidationSchema = z
  .object({
    email: z
      .string({
        required_error: 'field email is required',
      })

      .email(),
    password: z
      .string({
        required_error: 'field password is required',
      })
      .min(8, 'Password must contain at least 8 characters'),
  })
  .required();

export type signInDto = z.infer<typeof signInValidationSchema>;
