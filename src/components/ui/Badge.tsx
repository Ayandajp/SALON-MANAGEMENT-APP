import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  const variants = {
    neutral: 'bg-surface dark:bg-dark-surface text-text-secondary dark:text-gray-400 border border-border dark:border-dark-border',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-success/10 text-success border border-success/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
  };

  return (
    <span className={`inline-flex items-center px-sm py-xs rounded-md text-caption font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
