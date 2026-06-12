"use client";

interface SortDropdownProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
}

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "color", label: "Color" },
];

export function SortDropdown({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: SortDropdownProps) {
  return (
    <div className="flex gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        title={sortOrder === "asc" ? "Ascending" : "Descending"}
      >
        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
      </button>
    </div>
  );
}
