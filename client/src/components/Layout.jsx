import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BudgetWarnings from "./BudgetWarnings";

const linkStyle = ({ isActive }) => ({
  marginRight: 16,
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
  color: "#1f2937",
});

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          padding: "12px 16px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <strong style={{ marginRight: 24 }}>SpendWise</strong>
        <NavLink to="/" end style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/transactions" style={linkStyle}>Transactions</NavLink>
        <NavLink to="/budgets" style={linkStyle}>Budgets</NavLink>
        <span style={{ marginLeft: "auto" }}>{user?.name}</span>
        <button onClick={logout}>Log out</button>
      </nav>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <BudgetWarnings />
        <Outlet />
      </main>
    </div>
  );
}