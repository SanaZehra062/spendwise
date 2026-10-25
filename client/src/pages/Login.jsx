import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your spending.">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label>Password</label>
        <input type="password" placeholder="Your password" {...register("password")} />
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}

        {serverError && <p className="field-error">{serverError}</p>}
        <button disabled={isSubmitting}>Log in</button>
      </form>
      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthLayout>
  );
}