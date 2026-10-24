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

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 16,
};

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h2>Dashboard</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ margin: 0 }}
          />
          <button onClick={() => setMonth("")}>All time</button>
          <button onClick={exportCsv} disabled={exporting}>
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          margin: "16px 0",
        }}
      >
        <div style={card}>
          <div style={{ color: "#6b7280" }}>Balance ({label})</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: summary.balance < 0 ? "#dc2626" : "#1f2937",
            }}
          >
            {fmt(summary.balance)}
          </div>
        </div>
        <div style={card}>
          <div style={{ color: "#6b7280" }}>Income</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#16a34a" }}>
            {fmt(summary.income)}
          </div>
        </div>
        <div style={card}>
          <div style={{ color: "#6b7280" }}>Expense</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#dc2626" }}>
            {fmt(summary.expense)}
          </div>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 12,
        }}
      >
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Spending by category ({label})</h3>
          {byCategory.length === 0 ? (
            <p>No expenses for this period.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
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

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Last 6 months</h3>
          {monthly.length === 0 ? (
            <p>No data yet.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="income" fill="#16a34a" />
                  <Bar dataKey="expense" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}