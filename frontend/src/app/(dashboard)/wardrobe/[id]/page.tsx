"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";
import { ClothingItem, CATEGORIES, SEASONS } from "@/types/wardrobe";

export default function ClothingItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const itemId = params.id as string;
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["wardrobe", itemId],
    queryFn: async () => {
      const res = await api.get<ClothingItem>(`/wardrobe/${itemId}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put(`/wardrobe/${itemId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe", itemId] });
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/wardrobe/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      router.push("/wardrobe");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Item not found</h2>
        <button
          onClick={() => router.push("/wardrobe")}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          Back to Wardrobe
        </button>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "clothing_type", label: "Type", required: true },
    { key: "category", label: "Category", required: true, options: CATEGORIES },
    { key: "color", label: "Color", required: true },
    { key: "pattern", label: "Pattern" },
    { key: "material", label: "Material" },
    { key: "season", label: "Season", options: SEASONS },
    { key: "brand", label: "Brand" },
    { key: "notes", label: "Notes" },
  ];

  const startEditing = () => {
    setEditData({
      name: item.name,
      clothing_type: item.clothing_type,
      category: item.category,
      color: item.color,
      pattern: item.pattern || "",
      material: item.material || "",
      season: item.season || "",
      brand: item.brand || "",
      notes: item.notes || "",
    });
    setEditing(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/wardrobe")}
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors"
      >
        ← Back to Wardrobe
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 aspect-square">
          <img
            src={`${apiUrl}/${item.image_url}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      {field.label} {field.required && "*"}
                    </label>
                    {field.options ? (
                      <select
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        {field.options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : field.key === "notes" ? (
                      <textarea
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate(editData)}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{item.name}</h1>
              <div className="space-y-2">
                {fields.slice(1).map((field) => {
                  const value = (item as any)[field.key];
                  if (!value) return null;
                  return (
                    <div key={field.key} className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{field.label}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Added</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={startEditing}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this item?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
