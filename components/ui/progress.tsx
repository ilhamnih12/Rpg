import { cn, clamp } from '@/lib/utils';

export function Progress({ value, className, indicatorClassName, label }: { value: number; className?: string; indicatorClassName?: string; label?: string }) {
  const safe = clamp(value, 0, 100);
  return (
    <div className={cn('relative h-3 overflow-hidden rounded-full bg-muted', className)} aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}>
      <div className={cn('h-full rounded-full bg-primary transition-all duration-500', indicatorClassName)} style={{ width: `${safe}%` }} />
    </div>
  );
}
