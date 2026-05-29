import { cn } from "@/utils/cn";

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multi?: boolean;
}

export default function ChipSelect({ options, selected, onChange, multi = false }: ChipSelectProps) {
  const toggleOption = (opt: string) => {
    if (multi) {
      if (selected.includes(opt)) {
        onChange(selected.filter((s) => s !== opt));
      } else {
        onChange([...selected, opt]);
      }
    } else {
      onChange([opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-all duration-200 cursor-pointer",
              isSelected
                ? "bg-porcelain text-carbon border-porcelain shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                : "bg-transparent text-cloudburst border-starlight/20 hover:border-cyber-cyan/50 hover:text-porcelain"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
