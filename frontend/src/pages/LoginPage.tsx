import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data);
      navigate("/dashboard");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900">Log in</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input {...field("email")} type="email" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            {...field("password")}
            type="password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        {mutation.isError && <p className="text-sm text-red-600">Invalid email or password.</p>}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-gray-900 text-white rounded-md py-2 font-medium disabled:opacity-50"
        >
          {mutation.isPending ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-gray-600 text-center">
          No account?{" "}
          <Link to="/register" className="text-gray-900 font-medium underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
