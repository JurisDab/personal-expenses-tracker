import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Category, Transaction } from "../types";

const schema = z.object({
  categoryId: z.coerce.number().int().positive("Choose a category"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().max(255).optional(),
  date: z.string().min(1, "Date is required"),
});

export type TransactionFormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  categories: Category[];
  initial?: Transaction;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TransactionForm({ categories, initial, onSubmit, onCancel, isSubmitting }: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          categoryId: initial.categoryId,
          amount: initial.amount,
          description: initial.description ?? "",
          date: initial.date,
        }
      : {
          categoryId: categories[0]?.id,
          amount: undefined,
          description: "",
          date: new Date().toISOString().slice(0, 10),
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select {...register("categoryId")} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            {...register("date")}
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input {...register("description")} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 rounded-md border border-gray-300">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-2 rounded-md bg-gray-900 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
