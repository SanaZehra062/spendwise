import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api";
import { CATEGORIES } from "../constants";

// Keep these rules the same as server/validators/transactionSchemas.js
const schema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Choose a category"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Pick a date"),
  note: z
    .string()
    .trim()
    .max(200, "Note must be at most 200 characters")
    .optional(),
});

export default function TransactionForm({ initial, onSaved, onCancel }) {
  const [serverErrors, setServerErrors] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          type: initial.type,
          category: initial.category,
          amount: initial.amount,
          date: initial.date.slice(0, 10),
          note: initial.note || "",
        }
      : {
          type: "expense",
          category: CATEGORIES[0],
          amount: "",
          date: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD
          note: "",
        },
  });

  const onSubmit = async (data) => {
    setServerErrors([]);
    try {
      if (initial) {
        await api.patch(`/transactions/${initial._id}`, data);
      } else {
        await api.post("/transactions", data);
      }
      onSaved();
    } catch (err) {
      const body = err.response?.data;
      if (Array.isArray(body?.errors) && body.errors.length) {
        setServerErrors(
          body.errors.map((e) => (typeof e === "string" ? e : e.message))
        );
      } else {
        setServerErrors([body?.message || "Could not save transaction"]);
      }
    }
  };

  const err = (msg) => msg && <p style={{ color: "red", margin: 0 }}>{msg}</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {initial ? "Edit transaction" : "Add transaction"}
      </h3>

      <label>Type</label>
      <select {...register("type")}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <label>Category</label>
      <select {...register("category")}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {err(errors.category?.message)}

      <label>Amount</label>
      <input type="number" step="any" {...register("amount")} />
      {err(errors.amount?.message)}

      <label>Date</label>
      <input type="date" {...register("date")} />
      {err(errors.date?.message)}

      <label>Note (optional)</label>
      <input {...register("note")} />
      {err(errors.note?.message)}

      {serverErrors.map((msg, i) => (
        <p key={i} style={{ color: "red" }}>
          {msg}
        </p>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button disabled={isSubmitting}>
          {initial ? "Save changes" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ background: "#6b7280" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}