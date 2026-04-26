import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast, type Toast } from '../../hooks/useToast';

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-accent" />,
  };

  return (
    <div
      className="bg-background dark:bg-dark-surface border border-border dark:border-dark-border rounded-lg shadow-medium p-4 min-w-[300px] pointer-events-auto animate-slide-up"
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <p className="flex-1 text-body text-text-primary dark:text-white">
          {toast.message}
        </p>
      </div>
    </div>
  );
}