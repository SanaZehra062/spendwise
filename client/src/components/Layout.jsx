import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BudgetWarnings from "./BudgetWarnings";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="app-nav">
        <span className="brand">
          Spend<span>Wise</span>
        </span>
        <div className="nav-links">
          <NavLink to="/" end className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className="nav-link">
            Transactions
          </NavLink>
          <NavLink to="/budgets" className="nav-link">
            Budgets
          </NavLink>
        </div>
        <div className="nav-user">
          <span>{user?.name}</span>
          <button className="btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </nav>
      <main className="main">
        <BudgetWarnings />
        <Outlet />
      </main>
    </div>
  );
}