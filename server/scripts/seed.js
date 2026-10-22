import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const email = process.argv[2];
const reset = process.argv[3] === "reset";

if (!email) {
  console.error("Usage: node scripts/seed.js user@email.com [reset]");
  process.exit(1);
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const expenseCategories = [
  ["Food", 300, 1500],
  ["Transport", 100, 800],
  ["Shopping", 500, 5000],
  ["Bills", 1000, 6000],
  ["Entertainment", 300, 2000],
];

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOne({ email: email.toLowerCase() });
if (!user) {
  console.error("User not found:", email);
  process.exit(1);
}

if (reset) {
  const del = await Transaction.deleteMany({ user: user._id });
  console.log(`Deleted ${del.deletedCount} existing transactions`);
}

const now = new Date();
const docs = [];

for (let back = 0; back < 6; back++) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() - back;
  const maxDay = back === 0 ? Math.max(1, now.getUTCDate()) : 27;

  docs.push({
    user: user._id, type: "income", category: "Salary", amount: 60000,
    date: new Date(Date.UTC(y, m, 1)), note: "Monthly salary",
  });
  docs.push({
    user: user._id, type: "expense", category: "Rent", amount: 15000,
    date: new Date(Date.UTC(y, m, Math.min(5, maxDay))), note: "House rent",
  });

  for (let i = 0; i < 5; i++) {
    const [category, min, max] = expenseCategories[rand(0, expenseCategories.length - 1)];
    docs.push({
      user: user._id, type: "expense", category, amount: rand(min, max),
      date: new Date(Date.UTC(y, m, rand(1, maxDay))), note: `${category} expense`,
    });
  }
}

await Transaction.insertMany(docs);
console.log(`Inserted ${docs.length} transactions for ${user.email}`);
await mongoose.disconnect();