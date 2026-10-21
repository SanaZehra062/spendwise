import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(200, "Note must be at most 200 characters").optional(),
});

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });