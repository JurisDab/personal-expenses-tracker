import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Log by category",
    description: "Record every expense against a category like Food, Travel, or Bills — create your own anytime.",
  },
  {
    title: "Edit anytime",
    description: "Fix a typo, change the amount, move it to a different category. Nothing is locked in once logged.",
  },
  {
    title: "Monthly summaries",
    description: "See totals per category in a table and chart, month by month, so you know where the money went.",
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="font-semibold text-gray-900">Expense Tracker</span>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200">
            Log in
          </Link>
          <Link
            to="/register"
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <section className="py-16 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            Know where your money went, every month.
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Log expenses by category, edit them whenever you need, and see clear monthly summaries — no spreadsheet
            required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 pb-20">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="font-medium text-gray-900">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
