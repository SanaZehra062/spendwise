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
            className={`banner ${over ? "banner-over" : "banner-warn"}`}
          >
            <strong>{i.category}</strong>:{" "}
            {over ? "over budget" : "80% of budget used"} (
            {i.spent.toLocaleString()} of {i.limit.toLocaleString()},{" "}
            {Math.floor(i.percent)}%) <Link to="/budgets">View budgets</Link>
          </div>
        );
      })}
    </div>
  );
}