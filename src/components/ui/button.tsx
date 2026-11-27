import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-white shadow-xs hover:bg-neutral-800 active:bg-black',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200',
        outline:
          'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 shadow-2xs',
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
        destructive:
          'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
        accent:
          'border border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80 shadow-2xs',
        primaryBlue:
          'bg-[#1473e6] text-white hover:bg-[#0d66d0] shadow-xs',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-11 px-6 text-sm sm:text-base',
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
