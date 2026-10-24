import { useState } from "react";
import api from "../api";
import { CATEGORIES, currentMonth } from "../constants";
import useBudgetStatus, { statusOf } from "../hooks/useBudgetStatus";

// Budgets are for spending, so Salary is left out
const BUDGET_CATEGORIES = CATEGORIES.filter((c) => c !== "Salary");

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth());
  const activeMonth = month || currentMonth();
  const { items, loading, error, reload } = useBudgetStatus(activeMonth);

  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [limit, setLimit] = useState("");
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    const value = Number(limit);
    if (!value || value <= 0) {
      setFormErrors(["Limit must be greater than 0"]);
      return;
    }

    setSaving(true);
    try {
      // If this category already has a budget this month, update it
      const existing = items.find((i) => i.category === category);
      if (existing) {
        await api.patch(`/budgets/${existing._id}`, { limit: value });
      } else {
        await api.post("/budgets", {
          category,
          limit: value,
          month: activeMonth,
        });
      }
      setLimit("");
      reload();
    } catch (err) {
      const body = err.response?.data;
      if (Array.isArray(body?.errors) && body.errors.length) {
        setFormErrors(
          body.errors.map((x) => (typeof x === "string" ? x : x.message))
        );
      } else {
        setFormErrors([body?.message || "Could not save budget"]);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete the ${b.category} budget?`)) return;
    try {
      await api.delete(`/budgets/${b._id}`);
      reload();
    } catch (err) {
      setFormErrors([err.response?.data?.message || "Could not delete budget"]);
    }
  };

  const startEdit = (b) => {
    setCategory(b.category);
    setLimit(String(b.limit));
    setFormErrors([]);
  };

  return (
    <div>
      <h2>Budgets</h2>

      <label>Month</label>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        style={{ maxWidth: 220 }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          margin: "16px 0",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Set a budget</h3>

        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {BUDGET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label>Monthly limit</label>
        <input
          type="number"
          step="any"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />

        {formErrors.map((msg, i) => (
          <p key={i} style={{ color: "red" }}>
            {msg}
          </p>
        ))}

        <button disabled={saving}>Save budget</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && !error && items.length === 0 && (
        <p>No budgets for this month.</p>
      )}

      {items.map((b) => {
        const status = statusOf(b.percent);
        return (
          <div
            key={b._id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <strong>{b.category}</strong>
              <span style={{ color: status.color }}>{status.label}</span>
            </div>

            <div
              style={{
                background: "#e5e7eb",
                borderRadius: 4,
                height: 10,
                margin: "8px 0",
              }}
            >
              <div
                style={{
                  width: `${Math.min(b.percent, 100)}%`,
                  background: status.color,
                  height: 10,
                  borderRadius: 4,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span>
                {b.spent.toLocaleString()} of {b.limit.toLocaleString()} (
                {Math.floor(b.percent)}%)
              </span>
              <span>
                <button onClick={() => startEdit(b)} style={{ marginRight: 8 }}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  style={{ background: "#dc2626" }}
                >
                  Delete
                </button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}