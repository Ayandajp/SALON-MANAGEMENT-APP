import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="block text-body font-medium text-text-primary dark:text-white mb-2"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-sm py-sm bg-background dark:bg-dark-background border rounded-md text-body text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-danger focus:ring-danger' : 'border-border dark:border-dark-border'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={selectId}
        className="block text-body font-medium text-text-primary dark:text-white mb-2"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full px-sm py-sm bg-background dark:bg-dark-background border rounded-md text-body text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-danger focus:ring-danger' : 'border-border dark:border-dark-border'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${textareaId}-error`;

  return (
    <div className={className}>
      <label
        htmlFor={textareaId}
        className="block text-body font-medium text-text-primary dark:text-white mb-2"
      >
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`w-full px-sm py-sm bg-background dark:bg-dark-background border rounded-md text-body text-text-primary dark:text-white placeholder:text-text-secondary dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
          error ? 'border-danger focus:ring-danger' : 'border-border dark:border-dark-border'
        }`}
        rows={3}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
