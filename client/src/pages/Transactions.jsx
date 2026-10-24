import { useEffect, useState } from "react";
import api from "../api";
import { CATEGORIES } from "../constants";
import TransactionForm from "../components/TransactionForm";

const LIMIT = 10;

export default function Transactions() {
  const [filters, setFilters] = useState({ month: "", type: "", category: "" });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [formState, setFormState] = useState(null); // null | { initial }
  const [data, setData] = useState({ transactions: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait 400ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch the list whenever the page, filters, search or reloadKey change
  useEffect(() => {
    let cancelled = false;

    const params = { page, limit: LIMIT };
    if (filters.month) params.month = filters.month;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (search) params.search = search;

    setLoading(true);
    setError("");
    api
      .get("/transactions", { params })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.response?.data?.message || "Could not load transactions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, filters, search, reloadKey]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearAll = () => {
    setFilters({ month: "", type: "", category: "" });
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSaved = () => {
    setFormState(null);
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete this ${t.category} transaction?`)) return;
    try {
      await api.delete(`/transactions/${t._id}`);
      // If that was the last row on this page, go back one page
      if (data.transactions.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete transaction");
    }
  };

  const { transactions, pagination } = data;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Transactions</h2>
        <button onClick={() => setFormState({ initial: null })}>
          + Add transaction
        </button>
      </div>

      {formState && (
        <TransactionForm
          key={formState.initial?._id || "new"}
          initial={formState.initial}
          onSaved={handleSaved}
          onCancel={() => setFormState(null)}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <input
          type="month"
          value={filters.month}
          onChange={(e) => updateFilter("month", e.target.value)}
        />
        <select
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          placeholder="Search note or category"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <button onClick={clearAll} style={{ marginBottom: 12 }}>
        Clear filters
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && !error && transactions.length === 0 && (
        <p>No transactions found.</p>
      )}

      {transactions.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: 8 }}>Date</th>
                <th style={{ padding: 8 }}>Type</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Note</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 8 }}>{t.date.slice(0, 10)}</td>
                  <td style={{ padding: 8 }}>{t.type}</td>
                  <td style={{ padding: 8 }}>{t.category}</td>
                  <td
                    style={{
                      padding: 8,
                      color: t.type === "income" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {t.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: 8 }}>{t.note}</td>
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => setFormState({ initial: t })}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      style={{ background: "#dc2626" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
          }}
        >
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}