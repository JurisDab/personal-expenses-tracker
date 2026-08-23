import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Category } from "../types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a hex color like #F97316"),
});

export type CategoryFormValues = z.infer<typeof schema>;

interface CategoryFormProps {
  initial?: Category;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoryForm({ initial, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { name: "", color: "#6B7280" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input {...register("name")} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          {...register("color")}
          placeholder="#F97316"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.color && <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>}
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
