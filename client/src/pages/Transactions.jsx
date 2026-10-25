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
      <div className="page-head">
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

      <div className="card">
        <div className="filters">
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
        <button className="btn-ghost btn-sm" onClick={clearAll}>
          Clear filters
        </button>

        {error && <p className="field-error">{error}</p>}
        {loading && <p className="muted">Loading...</p>}

        {!loading && !error && transactions.length === 0 && (
          <p className="muted">No transactions found.</p>
        )}

        {transactions.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{t.date.slice(0, 10)}</td>
                    <td>
                      <span className={`badge badge-${t.type}`}>{t.type}</span>
                    </td>
                    <td>{t.category}</td>
                    <td className={t.type === "income" ? "amt-income" : "amt-expense"}>
                      {t.type === "income" ? "+" : "-"}
                      {t.amount.toLocaleString()}
                    </td>
                    <td className="note">{t.note}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => setFormState({ initial: t })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete(t)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 0 && (
          <div className="pager">
            <button
              className="btn-ghost btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="muted">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total)
            </span>
            <button
              className="btn-ghost btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}