import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'gold' | 'danger' }) {
  const styles = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    outline: 'bg-background text-foreground border-border',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300',
    gold: 'bg-gold/15 text-amber-700 border-gold/30 dark:text-amber-200',
    danger: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', styles[variant], className)} {...props} />;
}
