import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-label="Talendly home"
      className={cn(
        'text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight',
        className,
      )}
      {...props}
    >
      <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
        T
      </span>
      Talendly
    </div>
  );
}
