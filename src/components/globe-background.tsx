export function GlobeBackground() {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 text-foreground/[0.04]"
    >
      <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="200" cy="200" rx="70" ry="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="200" cy="200" rx="140" ry="180" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="200" cy="120" rx="170" ry="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="200" cy="280" rx="170" ry="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
