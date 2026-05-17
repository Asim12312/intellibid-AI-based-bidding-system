import { z } from 'zod';

export const signupSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['buyer', 'seller', 'hybrid']).default('buyer'),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});