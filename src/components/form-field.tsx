import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {required ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-rose-700">
            必須
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">
            任意
          </span>
        )}
      </div>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      {children}
      <p className={cn("min-h-5 text-xs text-rose-600", !error && "invisible")}>{error || "_"}</p>
    </div>
  );
}
