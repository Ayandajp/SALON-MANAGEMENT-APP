import { useState, useCallback } from 'react';

export interface UndoItem<T> {
  id: string;
  item: T;
  message: string;
}

export function useUndo<T>() {
  const [undoItem, setUndoItem] = useState<UndoItem<T> | null>(null);

  const scheduleUndo = useCallback((item: T, message: string) => {
    const id = Date.now().toString();
    setUndoItem({ id, item, message });
  }, []);

  const executeUndo = useCallback((): T | null => {
    if (!undoItem) return null;
    const item = undoItem.item;
    setUndoItem(null);
    return item;
  }, [undoItem]);

  const clearUndo = useCallback(() => {
    setUndoItem(null);
  }, []);

  return {
    undoItem,
    scheduleUndo,
    executeUndo,
    clearUndo,
  };
}
