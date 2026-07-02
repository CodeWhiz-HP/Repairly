import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address!" }).min(1, { message: "Email is required!" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Must contain at least one special character",
    }),
});

export const registerSchema = z.object({
    name: z.string().min(1, {
      message: "Name is required!",
    }),

    role: z.enum(["Customer","Technician"]),

    email: z.email({ message: "Invalid email address!" }).min(1, { message: "Email is required!" }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters!" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Must contain at least one special character",
      }),

    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required!" }),

    businessName: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match!",
    path: ["confirmPassword"],
});

export type FormState = {
  success?: boolean | null;
  message?: string;
  errors?: {
    name?: string[];
    role?: string[];
    businessName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};