import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05),0_1px_3px_rgba(15,23,42,0.03)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5 p-5 sm:p-6 pb-4', className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-base sm:text-lg font-semibold tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs sm:text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6 pt-2', className)} {...props} />;
}
