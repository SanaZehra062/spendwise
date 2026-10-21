import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const notFound = (res) =>
  res.status(404).json({ message: "Transaction not found" });

// POST /api/transactions
export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json({ transaction });
});

// GET /api/transactions
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({
    date: -1,
    createdAt: -1,
  });
  res.json({ transactions });
});

// GET /api/transactions/:id
export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!transaction) return notFound(res);
  res.json({ transaction });
});

// PATCH /api/transactions/:id
export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!transaction) return notFound(res);
  res.json({ transaction });
});

// DELETE /api/transactions/:id
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!transaction) return notFound(res);
  res.json({ message: "Transaction deleted", id: transaction._id });
});