import { z } from "zod";

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

export const createBudgetSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),
  limit: z.coerce.number().positive("Limit must be greater than 0"),
  month: monthSchema,
});

export const updateBudgetSchema = z.object({
  limit: z.coerce.number().positive("Limit must be greater than 0"),
});

export const budgetQuerySchema = z.object({
  month: monthSchema.optional(),
});