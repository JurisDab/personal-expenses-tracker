import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200"
  }`;

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 mr-4">Expense Tracker</span>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={navLinkClass}>
            Transactions
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{user?.name}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
