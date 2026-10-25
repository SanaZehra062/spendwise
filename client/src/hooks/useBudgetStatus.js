import { useCallback, useEffect, useState } from "react";
import api from "../api";

export const statusOf = (percent) => {
  if (percent >= 100) return { color: "#b4443a", label: "Over budget" };
  if (percent >= 80) return { color: "#b7791f", label: "80% used" };
  return { color: "#1a6b52", label: "On track" };
};

// Loads the budgets of a month together with how much was spent per category.
// Change refreshKey to force a reload.
export default function useBudgetStatus(month, refreshKey = 0) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [budgetRes, spentRes] = await Promise.all([
        api.get("/budgets", { params: { month } }),
        api.get("/reports/by-category", { params: { month } }),
      ]);

      const spentByCategory = {};
      spentRes.data.forEach((r) => {
        spentByCategory[r.category] = r.total;
      });

      setItems(
        budgetRes.data.budgets.map((b) => {
          const spent = spentByCategory[b.category] || 0;
          return {
            ...b,
            spent,
            percent: b.limit > 0 ? (spent / b.limit) * 100 : 0,
          };
        })
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not load budgets");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return { items, loading, error, reload: load };
}