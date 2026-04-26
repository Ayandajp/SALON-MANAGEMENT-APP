interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          aria-label={label || 'Toggle'}
          aria-checked={checked}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors relative ${
            checked ? 'bg-accent' : 'bg-border dark:bg-dark-border'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-text-secondary dark:bg-gray-600 rotate-45" />
            </div>
          )}
        </div>
      </div>
      {label && (
        <span className={`text-body ${disabled ? 'text-text-secondary dark:text-gray-400' : 'text-text-primary dark:text-white'}`}>
          {label}
        </span>
      )}
    </label>
  );
}