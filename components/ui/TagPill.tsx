import { cn } from "@/lib/cn";

interface TagPillProps {
  name: string;
  className?: string;
}

export function TagPill({ name, className }: TagPillProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink/8 text-ink/70 hover:bg-ink/12 transition-colors",
        className
      )}
    >
      {name}
    </span>
  );
}
