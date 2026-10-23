import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const buildMatch = (req) => {
  const match = { user: new mongoose.Types.ObjectId(req.user._id) };
  const { month } = req.query; // e.g. 2026-10
  if (month) {
    const [y, m] = month.split("-").map(Number);
    match.date = {
      $gte: new Date(Date.UTC(y, m - 1, 1)),
      $lt: new Date(Date.UTC(y, m, 1)),
    };
  }
  return match;
};

const csvEscape = (value) => {
  let s = value === null || value === undefined ? "" : String(value);
  // Excel formula injection se bachao (=, +, -, @ se shuru hone wali text)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const getSummary = async (req, res, next) => {
  try {
    const match = buildMatch(req);

    const rows = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const income = rows.find((r) => r._id === "income")?.total || 0;
    const expense = rows.find((r) => r._id === "expense")?.total || 0;
    res.json({ income, expense, balance: income - expense });
  } catch (err) {
    next(err);
  }
};

export const getByCategory = async (req, res, next) => {
  try {
    const match = buildMatch(req);
    match.type = req.query.type === "income" ? "income" : "expense";

    const rows = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, category: "$_id", total: 1 } },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getMonthly = async (req, res, next) => {
  try {
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
    );
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const rows = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$date" }, m: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)
      );
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const find = (type) =>
        rows.find((r) => r._id.y === y && r._id.m === m && r._id.type === type)
          ?.total || 0;

      months.push({
        month: `${y}-${String(m).padStart(2, "0")}`,
        income: find("income"),
        expense: find("expense"),
      });
    }

    res.json(months);
  } catch (err) {
    next(err);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const match = buildMatch(req);
    const { type, category } = req.query;
    if (type === "income" || type === "expense") match.type = type;
    if (typeof category === "string" && category) match.category = category;

    const rows = await Transaction.find(match).sort({ date: -1 }).lean();

    const header = ["Date", "Type", "Category", "Amount", "Note"];
    const lines = rows.map((t) =>
      [
        t.date.toISOString().slice(0, 10),
        t.type,
        t.category,
        t.amount,
        t.note,
      ]
        .map(csvEscape)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transactions.csv"'
    );
    res.send("\uFEFF" + csv);
  } catch (err) {
    next(err);
  }
};