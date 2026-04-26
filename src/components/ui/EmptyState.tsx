import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  illustration?: 'scissors' | 'receipt' | 'chart' | 'users' | 'wallet';
}

const illustrations = {
  scissors: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-4">
      <circle cx="60" cy="60" r="50" fill="currentColor" className="text-surface dark:text-dark-surface" />
      <path d="M40 45L60 60L40 75M80 45L60 60L80 75" stroke="currentColor" className="text-accent" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="45" r="5" fill="currentColor" className="text-accent" />
      <circle cx="40" cy="75" r="5" fill="currentColor" className="text-accent" />
      <circle cx="80" cy="45" r="5" fill="currentColor" className="text-accent" />
      <circle cx="80" cy="75" r="5" fill="currentColor" className="text-accent" />
    </svg>
  ),
  receipt: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-4">
      <rect x="35" y="25" width="50" height="70" rx="4" fill="currentColor" className="text-surface dark:text-dark-surface" />
      <rect x="35" y="25" width="50" height="70" rx="4" stroke="currentColor" className="text-border dark:text-dark-border" strokeWidth="2" />
      <line x1="45" y1="40" x2="75" y2="40" stroke="currentColor" className="text-accent" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="50" x2="70" y2="50" stroke="currentColor" className="text-text-secondary dark:text-gray-400" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="60" x2="65" y2="60" stroke="currentColor" className="text-text-secondary dark:text-gray-400" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="75" x2="75" y2="75" stroke="currentColor" className="text-accent" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  chart: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-4">
      <rect x="30" y="70" width="12" height="20" rx="2" fill="currentColor" className="text-accent opacity-60" />
      <rect x="48" y="55" width="12" height="35" rx="2" fill="currentColor" className="text-accent opacity-75" />
      <rect x="66" y="45" width="12" height="45" rx="2" fill="currentColor" className="text-accent" />
      <rect x="84" y="60" width="12" height="30" rx="2" fill="currentColor" className="text-accent opacity-80" />
      <line x1="25" y1="90" x2="100" y2="90" stroke="currentColor" className="text-border dark:text-dark-border" strokeWidth="2" />
      <line x1="25" y1="35" x2="25" y2="90" stroke="currentColor" className="text-border dark:text-dark-border" strokeWidth="2" />
    </svg>
  ),
  users: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-4">
      <circle cx="50" cy="45" r="12" fill="currentColor" className="text-accent" />
      <path d="M30 75C30 65 40 60 50 60C60 60 70 65 70 75" stroke="currentColor" className="text-accent" strokeWidth="3" strokeLinecap="round" />
      <circle cx="75" cy="50" r="10" fill="currentColor" className="text-accent opacity-70" />
      <path d="M60 80C60 72 67 68 75 68C83 68 90 72 90 80" stroke="currentColor" className="text-accent opacity-70" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-4">
      <rect x="30" y="40" width="60" height="40" rx="4" fill="currentColor" className="text-surface dark:text-dark-surface" />
      <rect x="30" y="40" width="60" height="40" rx="4" stroke="currentColor" className="text-border dark:text-dark-border" strokeWidth="2" />
      <rect x="70" y="55" width="15" height="10" rx="2" fill="currentColor" className="text-accent" />
      <line x1="40" y1="50" x2="55" y2="50" stroke="currentColor" className="text-text-secondary dark:text-gray-400" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="60" x2="60" y2="60" stroke="currentColor" className="text-text-secondary dark:text-gray-400" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function EmptyState({ icon, title, description, action, illustration }: EmptyStateProps) {
  return (
    <Card className="text-center py-xl">
      <div className="max-w-md mx-auto">
        {illustration && illustrations[illustration] ? (
          illustrations[illustration]
        ) : (
          <div className="w-16 h-16 bg-surface dark:bg-dark-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary dark:text-gray-400">
            {icon}
          </div>
        )}
        <h2 className="text-h2 font-heading font-semibold text-text-primary dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-body text-text-secondary dark:text-gray-400 mb-6">
          {description}
        </p>
        {action}
      </div>
    </Card>
  );
}
