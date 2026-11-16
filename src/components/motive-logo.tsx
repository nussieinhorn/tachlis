import { cn } from "@/lib/utils";

/** The MOTIVE mark (an open ring with a coral dot, three spark strokes and a check). Ring follows the text colour. */
export function MotiveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <circle
        cx="22"
        cy="26"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="78.5 15.7"
        transform="rotate(350 22 26)"
      />
      <circle cx="33.5" cy="16.4" r="5" fill="#f45d48" />
      <g fill="none" stroke="#f45d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34.9 8.5l.6-3.5" />
        <path d="M39.6 11.2l2.7-2.2" />
        <path d="M41.5 16.4H45" />
      </g>
      <path
        d="M17.4 26.4l3.7 3.7 6.5-7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MotiveLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-foreground", className)}>
      <MotiveMark />
      <span className="font-logo text-2xl font-extrabold leading-none tracking-tight">motive</span>
    </span>
  );
}
