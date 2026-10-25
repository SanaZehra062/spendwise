import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

// Keep these rules the same as server/validators/authSchemas.js
const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export default function Signup() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerErrors([]);
    try {
      await signup(data);
      navigate("/");
    } catch (err) {
      const body = err.response?.data;
      if (Array.isArray(body?.errors) && body.errors.length) {
        setServerErrors(
          body.errors.map((e) => (typeof e === "string" ? e : e.message))
        );
      } else {
        setServerErrors([body?.message || "Signup failed"]);
      }
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Name</label>
        <input placeholder="Your name" {...register("name")} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}

        <label>Email</label>
        <input placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <label>Password</label>
        <input type="password" placeholder="At least 8 characters" {...register("password")} />
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}

        {serverErrors.map((msg, i) => (
          <p key={i} className="field-error">
            {msg}
          </p>
        ))}
        <button disabled={isSubmitting}>Create account</button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}