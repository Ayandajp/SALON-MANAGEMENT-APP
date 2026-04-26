import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-background dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg p-lg shadow-subtle ${className}`}>
      {children}
    </div>
  );
}
