import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  importTransactionsCsv,
  updateTransaction,
  type ImportResult,
} from "../api/transactions";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import type { Transaction } from "../types";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(value);
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(currentMonth());
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", month, categoryId, page],
    queryFn: () =>
      fetchTransactions({
        month,
        categoryId: categoryId === "" ? undefined : categoryId,
        page,
      }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["summary"] });
  }

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: () => setError("Could not save transaction."),
  });

  const updateMutation = useMutation({
    mutationFn: (values: TransactionFormValues) => updateTransaction(editing!.id, values),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: () => setError("Could not save transaction."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: invalidate,
  });

  const importMutation = useMutation({
    mutationFn: importTransactionsCsv,
    onSuccess: (result) => {
      setImportResult(result);
      setImportError(null);
      invalidate();
    },
    onError: () => {
      setImportResult(null);
      setImportError("Could not import that file. Make sure it's a Swedbank CSV statement export.");
    },
  });

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      importMutation.mutate(file);
    }
  }

  function openCreate() {
    setEditing(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSubmit(values: TransactionFormValues) {
    setError(null);
    if (editing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileSelected}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
          >
            {importMutation.isPending ? "Importing..." : "Import CSV"}
          </button>
          <button onClick={openCreate} className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium">
            Add transaction
          </button>
        </div>
      </div>

      {importResult && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
          Imported {importResult.imported} of {importResult.totalRows} rows
          {importResult.duplicates > 0 && ` — skipped ${importResult.duplicates} already-imported duplicates`}
          {importResult.skipped > 0 && ` — skipped ${importResult.skipped} non-expense rows`}.
          <button onClick={() => setImportResult(null)} className="ml-3 text-gray-500 underline">
            Dismiss
          </button>
        </div>
      )}
      {importError && (
        <div className="bg-white rounded-lg border border-red-200 p-4 text-sm text-red-600">
          {importError}
          <button onClick={() => setImportError(null)} className="ml-3 text-red-500 underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
            setPage(0);
          }}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && categories && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <TransactionForm
            categories={categories}
            initial={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {isLoading && <p className="text-gray-600">Loading...</p>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {transactions?.content.map((t) => (
              <tr key={t.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{t.date}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.categoryColor }} />
                    {t.categoryName}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600">{t.description}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(t)} className="text-gray-600 hover:text-gray-900 mr-3">
                    Edit
                  </button>
                  <button onClick={() => deleteMutation.mutate(t.id)} className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions?.content.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No transactions for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {transactions && transactions.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {transactions.number + 1} of {transactions.totalPages}
          </span>
          <button
            disabled={page >= transactions.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
