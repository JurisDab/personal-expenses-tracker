import { apiClient } from "./client";
import type { Page, Transaction } from "../types";

export interface TransactionPayload {
  categoryId: number;
  amount: number;
  description?: string;
  date: string;
}

export interface ListTransactionsParams {
  month: string;
  categoryId?: number;
  page?: number;
  size?: number;
}

export async function fetchTransactions(params: ListTransactionsParams): Promise<Page<Transaction>> {
  const { data } = await apiClient.get<Page<Transaction>>("/transactions", { params });
  return data;
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>("/transactions", payload);
  return data;
}

export async function updateTransaction(id: number, payload: TransactionPayload): Promise<Transaction> {
  const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  duplicates: number;
}

export async function importTransactionsCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<ImportResult>("/transactions/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
