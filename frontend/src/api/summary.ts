import { apiClient } from "./client";
import type { MonthlySummary } from "../types";

export async function fetchMonthlySummary(month: string): Promise<MonthlySummary> {
  const { data } = await apiClient.get<MonthlySummary>("/summary/monthly", { params: { month } });
  return data;
}
