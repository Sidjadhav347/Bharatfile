import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
  disabled = false,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[#1965e0]' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}
