import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:ring-4 focus:ring-[#4ea9d92f] focus:border-[#4ea9d9] appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
