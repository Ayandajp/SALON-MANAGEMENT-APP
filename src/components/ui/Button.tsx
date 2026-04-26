import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-md py-sm rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-dark-background disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90 active:bg-accent/80',
    secondary: 'bg-surface dark:bg-dark-surface text-text-primary dark:text-white border border-border dark:border-dark-border hover:bg-border/50 dark:hover:bg-dark-border/50',
    danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
