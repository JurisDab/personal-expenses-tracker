import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchMonthlySummary } from "../api/summary";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(value);
}

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["summary", month],
    queryFn: () => fetchMonthlySummary(month),
  });

  const chartData = (data?.categories ?? [])
    .filter((c) => c.total > 0)
    .map((c) => ({ name: c.categoryName, total: c.total, fill: c.categoryColor }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Monthly summary</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {isLoading && <p className="text-gray-600">Loading...</p>}
      {isError && <p className="text-red-600">Could not load summary.</p>}

      {data && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total spent</p>
            <p className="text-3xl font-semibold text-gray-900">{formatCurrency(data.grandTotal)}</p>
          </div>

          {chartData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="#111827" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c) => (
                  <tr key={c.categoryId} className="border-t border-gray-100">
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.categoryColor }} />
                        {c.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">{formatCurrency(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
