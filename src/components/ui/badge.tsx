import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-800 border border-slate-200',
        emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        amber: 'bg-amber-50 text-amber-800 border border-amber-200',
        indigo: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
        rose: 'bg-rose-50 text-rose-800 border border-rose-200',
        sky: 'bg-sky-50 text-sky-800 border border-sky-200',
        violet: 'bg-violet-50 text-violet-800 border border-violet-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
