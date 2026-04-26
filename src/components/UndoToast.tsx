import { useEffect, useState } from 'react';
import { Undo } from 'lucide-react';
import { Button } from './ui/Button';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onExpire: () => void;
  duration?: number;
}

export function UndoToast({ message, onUndo, onExpire, duration = 5000 }: UndoToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev - (100 / (duration / 100));
        return next <= 0 ? 0 : next;
      });
    }, 100);

    const timeout = setTimeout(() => {
      onExpire();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onExpire]);

  return (
    <div
      className="bg-background dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-medium p-4 min-w-[350px] relative overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-2">
        <p className="flex-1 text-body text-text-primary dark:text-white">
          {message}
        </p>
        <Button
          variant="secondary"
          onClick={onUndo}
          className="!px-3 !py-2 gap-2"
          aria-label="Undo deletion"
        >
          <Undo className="w-4 h-4" />
          Undo
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface dark:bg-dark-surface">
        <div
          className="h-full bg-accent transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}