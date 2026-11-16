/** Page-loading state: the MOTIVE mark, gently alive. The ring turns, the dot breathes and the sparks twinkle. */
export function LogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-20 text-foreground">
        <g className="logo-ring" style={{ transformOrigin: "22px 26px" }}>
          <circle
            cx="22"
            cy="26"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="78.5 15.7"
            transform="rotate(350 22 26)"
          />
        </g>
        <path
          d="M17.4 26.4l3.7 3.7 6.5-7.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle className="logo-dot" cx="33.5" cy="16.4" r="5" fill="#f45d48" style={{ transformOrigin: "33.5px 16.4px" }} />
        <g fill="none" stroke="#f45d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="logo-sparks">
          <path d="M34.9 8.5l.6-3.5" />
          <path d="M39.6 11.2l2.7-2.2" />
          <path d="M41.5 16.4H45" />
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
