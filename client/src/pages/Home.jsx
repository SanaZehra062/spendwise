import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../api";
import { currentMonth } from "../constants";

const COLORS = ["#14523f", "#b8935a", "#1a6b52", "#d9c08f", "#0a2e24", "#7a9e8e", "#8c6a35"];

export default function Home() {
  const [month, setMonth] = useState(currentMonth()); // empty = all time
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [byCategory, setByCategory] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  // Cards and pie chart follow the selected month
  useEffect(() => {
    let cancelled = false;
    const params = month ? { month } : {};

    setLoading(true);
    setError("");
    Promise.all([
      api.get("/reports/summary", { params }),
      api.get("/reports/by-category", { params }),
    ])
      .then(([summaryRes, categoryRes]) => {
        if (cancelled) return;
        setSummary(summaryRes.data);
        setByCategory(categoryRes.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || "Could not load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  // The bar chart always shows the last 6 months
  useEffect(() => {
    let cancelled = false;
    api
      .get("/reports/monthly")
      .then((res) => {
        if (!cancelled) setMonthly(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || "Could not load dashboard");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The export route needs the token, so we download it with axios, not a plain link
  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/reports/export", {
        params: month ? { month } : {},
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "text/csv" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = month ? `transactions-${month}.csv` : "transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Could not export CSV");
    } finally {
      setExporting(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString();
  const label = month ? month : "All time";

  return (
    <div>
      <div className="page-head">
        <h2>Dashboard</h2>
        <div className="toolbar">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button className="btn-ghost" onClick={() => setMonth("")}>
            All time
          </button>
          <button onClick={exportCsv} disabled={exporting}>
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="grid-stats">
        <div className="card">
          <div className="stat-label">Balance ({label})</div>
          <div className={`stat-value ${summary.balance < 0 ? "neg" : ""}`}>
            {fmt(summary.balance)}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Income</div>
          <div className="stat-value pos">{fmt(summary.income)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Expense</div>
          <div className="stat-value neg">{fmt(summary.expense)}</div>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}

      <div className="grid-charts">
        <div className="card">
          <h3>Spending by category ({label})</h3>
          {byCategory.length === 0 ? (
            <p className="muted">No expenses for this period.</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="total"
                    nameKey="category"
                    outerRadius={90}
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Last 6 months</h3>
          {monthly.length === 0 ? (
            <p className="muted">No data yet.</p>
          ) : (
            <div className="chart-box">
              <ResponsiveContainer>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efe6cf" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="income" fill="#1a6b52" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#b8935a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}