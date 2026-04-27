import { cn } from "@/lib/utils";

export function OptionCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99]",
              isActive
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
