import { z } from "zod";

// Matches the BE cap at `src/api/auth_endpoints.rs:34-35` (MAX_PASSWORD_LEN = 1024).
const MAX_PASSWORD_LEN = 1024;
const MIN_NEW_PASSWORD_LEN = 8;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Enter your current password." })
      .max(MAX_PASSWORD_LEN, {
        message: `Password must be ${MAX_PASSWORD_LEN} characters or fewer.`,
      }),
    newPassword: z
      .string()
      .min(MIN_NEW_PASSWORD_LEN, {
        message: `New password must be at least ${MIN_NEW_PASSWORD_LEN} characters.`,
      })
      .max(MAX_PASSWORD_LEN, {
        message: `Password must be ${MAX_PASSWORD_LEN} characters or fewer.`,
      }),
    confirmPassword: z.string().min(1, { message: "Re-enter your new password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match.",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must differ from your current password.",
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
