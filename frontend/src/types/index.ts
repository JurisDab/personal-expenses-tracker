export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Transaction {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  amount: number;
  description: string | null;
  date: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
}

export interface MonthlySummary {
  month: string;
  categories: CategorySummary[];
  grandTotal: number;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}
