import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={logout}>Log out</button>
    </div>
  );
}