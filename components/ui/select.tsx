import * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm transition disabled:opacity-50', className)} {...props}>
      {children}
    </select>
  );
}
