import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return <h2>Welcome, {user?.name}</h2>;
}