import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategory, deleteCategory, fetchCategories, updateCategory } from "../api/categories";
import { CategoryForm, type CategoryFormValues } from "../components/CategoryForm";
import type { Category } from "../types";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: () => setError("Could not save category. The name may already be in use."),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => updateCategory(editing!.id, values),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: () => setError("Could not save category. The name may already be in use."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
    onError: () => setError("Could not delete category. It may still have transactions."),
  });

  function openCreate() {
    setEditing(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSubmit(values: CategoryFormValues) {
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
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium">
          Add category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <CategoryForm
            initial={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {isLoading && <p className="text-gray-600">Loading...</p>}

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {categories?.map((category) => (
          <div key={category.id} className="flex items-center justify-between px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm text-gray-900">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(category)} className="text-sm text-gray-600 hover:text-gray-900">
                Edit
              </button>
              <button
                onClick={() => deleteMutation.mutate(category.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
