import { z } from "zod";

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const passwordRecoverySchema = z.object({
  email: z.string().email(),
});
