import { z } from "zod";

export const createLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  emailAddress: z.email().max(254),
  phoneNumber: z.string().trim().min(7).max(30),
  serviceType: z.enum([
    "companion-care",
    "personal-support",
    "recovery-at-home",
    "not-sure",
  ]),
  preferredContact: z.enum(["phone", "email"]),
  message: z.string().trim().max(1500).optional(),
  consent: z.literal(true),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
