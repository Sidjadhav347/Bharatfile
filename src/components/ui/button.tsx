import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#1965e0] to-[#0f54c2] text-white shadow-sm hover:from-[#175ccf] hover:to-[#0d4cb0]',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200/70',
        outline:
          'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-2xs',
        ghost: 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900',
        destructive:
          'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
        accent:
          'border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100/80 shadow-2xs',
        pill:
          'rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-11 px-5 text-sm rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Button.displayName = 'Button';
