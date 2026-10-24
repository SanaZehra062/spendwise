import { Link, useLocation } from "react-router-dom";
import { currentMonth } from "../constants";
import useBudgetStatus from "../hooks/useBudgetStatus";

export default function BudgetWarnings() {
  const { pathname } = useLocation();
  // Reloads every time the user moves to another page
  const { items } = useBudgetStatus(currentMonth(), pathname);

  const alerts = items.filter((i) => i.percent >= 80);
  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {alerts.map((i) => {
        const over = i.percent >= 100;
        return (
          <div
            key={i._id}
            style={{
              background: over ? "#fee2e2" : "#fef3c7",
              border: `1px solid ${over ? "#dc2626" : "#d97706"}`,
              borderRadius: 6,
              padding: "8px 12px",
              marginBottom: 8,
              color: "#1f2937",
            }}
          >
            <strong>{i.category}</strong>:{" "}
            {over ? "over budget" : "80% of budget used"} (
            {i.spent.toLocaleString()} of {i.limit.toLocaleString()},{" "}
            {Math.floor(i.percent)}%){" "}
            <Link to="/budgets">View budgets</Link>
          </div>
        );
      })}
    </div>
  );
}