import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastIdCounter = 0;
let globalSetToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  if (!globalSetToasts) {
    globalSetToasts = setToasts;
  }

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = { id, message, type };
    
    if (globalSetToasts) {
      globalSetToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        if (globalSetToasts) {
          globalSetToasts(prev => prev.filter(t => t.id !== id));
        }
      }, 3000);
    }
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

  return { toasts, success, error, info };
}
