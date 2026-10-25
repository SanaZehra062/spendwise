export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-side">
        <h1>SPENDWISE</h1>
        <div className="script">Know where it goes</div>
        <div className="gold-rule" />
        <p>
          Track income and expenses, set monthly budgets and see clear reports of
          your spending.
        </p>
      </aside>
      <section className="auth-main">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}