import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#0e2a47] text-white hover:bg-[#12345a] shadow-lg shadow-[#0e2a4730] border-transparent',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-100 border-transparent',
      outline: 'bg-white text-[#0e2a47] border-[#bfe4fb] hover:bg-[#eef8ff] hover:border-[#7ec2e7]',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 border-transparent',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-100 border-transparent',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-4 text-base rounded-2xl',
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none border",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
