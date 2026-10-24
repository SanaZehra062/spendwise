import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div style={{ maxWidth: 380, margin: "60px auto", padding: 16 }}>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input placeholder="Name" {...register("name")} />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>
        <div>
          <input placeholder="Email" {...register("email")} />
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>
        <div>
          <input type="password" placeholder="Password" {...register("password")} />
          {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>
        {serverErrors.map((msg, i) => (
          <p key={i} style={{ color: "red" }}>
            {msg}
          </p>
        ))}
        <button disabled={isSubmitting}>Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}