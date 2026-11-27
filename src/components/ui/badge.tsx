import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 border border-slate-200',
        emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
        amber: 'bg-amber-50 text-amber-800 border border-amber-200/80',
        indigo: 'bg-blue-50 text-blue-700 border border-blue-200/80',
        rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
        sky: 'bg-sky-50 text-sky-700 border border-sky-200/80',
        violet: 'bg-violet-50 text-violet-700 border border-violet-200/80',
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
