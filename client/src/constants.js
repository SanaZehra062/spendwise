export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Rent",
  "Salary",
];
// Current month as YYYY-MM (local time)
export const currentMonth = () =>
  new Date().toLocaleDateString("en-CA").slice(0, 7);