import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['buyer', 'seller', 'hybrid']).default('buyer')
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startingPrice: z.number().positive("Starting price must be positive"),
  category: z.string().min(1, "Category is required"),
  endTime: z.string().datetime("Invalid end time format")
});
