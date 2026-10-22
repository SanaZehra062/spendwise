import Transaction from "../models/Transaction.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

// GET /api/transactions?month=&category=&type=&search=&page=&limit=
export const getTransactions = asyncHandler(async (req, res) => {
  const { month, category, type, search, page, limit } = req.validatedQuery;

  const filter = { user: req.user._id };

  if (type) filter.type = type;
  if (category) filter.category = category;

  if (month) {
    const [y, m] = month.split("-").map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(y, m - 1, 1)),
      $lt: new Date(Date.UTC(y, m, 1)),
    };
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ note: rx }, { category: rx }];
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
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