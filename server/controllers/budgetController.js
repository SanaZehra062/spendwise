import Budget from "../models/Budget.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const notFound = (res) => res.status(404).json({ message: "Budget not found" });

// POST /api/budgets
export const createBudget = asyncHandler(async (req, res) => {
  const { category, limit, month } = req.body;

  const exists = await Budget.findOne({ user: req.user._id, category, month });
  if (exists) {
    return res
      .status(409)
      .json({ message: "A budget for this category and month already exists" });
  }

  const budget = await Budget.create({ user: req.user._id, category, limit, month });
  res.status(201).json({ budget });
});

// GET /api/budgets?month=2026-10
export const getBudgets = asyncHandler(async (req, res) => {
  const { month } = req.validatedQuery;

  const filter = { user: req.user._id };
  if (month) filter.month = month;

  const budgets = await Budget.find(filter).sort({ month: -1, category: 1 });
  res.json({ budgets });
});

// PATCH /api/budgets/:id
export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { limit: req.body.limit },
    { new: true, runValidators: true }
  );
  if (!budget) return notFound(res);
  res.json({ budget });
});

// DELETE /api/budgets/:id
export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!budget) return notFound(res);
  res.json({ message: "Budget deleted", id: budget._id });
});