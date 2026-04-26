import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  loading?: boolean;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  emptyMessage = 'No data available',
  loading = false,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border dark:border-dark-border">
        <table className="w-full">
          <thead className="bg-surface dark:bg-dark-surface">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-body font-semibold text-text-primary dark:text-white"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-dark-border">
            {[...Array(3)].map((_, idx) => (
              <tr key={idx}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="h-4 bg-surface dark:bg-dark-border rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-xl border border-border dark:border-dark-border rounded-lg bg-surface/50 dark:bg-dark-surface/50">
        <p className="text-body text-text-secondary dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border dark:border-dark-border">
      <table className="w-full">
        <thead className="bg-surface dark:bg-dark-surface">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-body font-semibold text-text-primary dark:text-white ${
                  column.sortable ? 'cursor-pointer hover:bg-border/50 dark:hover:bg-dark-border/50 select-none' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
                scope="col"
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span aria-label={`Sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}>
                      {sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-dark-border bg-background dark:bg-dark-background">
          {sortedData.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-surface/50 dark:hover:bg-dark-surface/50 transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-body text-text-primary dark:text-white">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
