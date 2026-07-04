import { cn } from "@/lib/utils";

export function NinjaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-8 w-8", className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Studio Ninja"
    >
      {/* rounded badge */}
      <rect x="2" y="4" width="44" height="40" rx="10" fill="#f4efe6" />
      {/* ninja hood */}
      <path
        d="M14 16c0-4 4-7 10-7s10 3 10 7v14c0 4-4 8-10 8s-10-4-10-8V16z"
        fill="#2b2b28"
      />
      {/* face strip */}
      <path
        d="M14 20c2.2-2 5.6-3 10-3s7.8 1 10 3v4c-2.2 2-5.6 3-10 3s-7.8-1-10-3v-4z"
        fill="#e7b18a"
      />
      {/* eyes */}
      <circle cx="20" cy="22" r="1.7" fill="#2b2b28" />
      <circle cx="28" cy="22" r="1.7" fill="#2b2b28" />
      {/* green headband */}
      <path d="M12 19h24v3.4H12z" fill="#089d5a" />
      {/* headband tail */}
      <path
        d="M36 19l9-4c1 2 .4 4-1.4 5l-7.6 2.4V19z"
        fill="#089d5a"
      />
    </svg>
  );
}

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <NinjaMark className="h-8 w-8 shrink-0" />
      <span className="flex items-baseline leading-none tracking-tight">
        <span
          className={cn(
            "text-[19px] font-semibold",
            light ? "text-white" : "text-foreground",
          )}
        >
          Studio
        </span>
        <span
          className={cn(
            "text-[20px] font-extrabold italic",
            light ? "text-white" : "text-foreground",
          )}
        >
          Ninja
        </span>
      </span>
    </div>
  );
}
