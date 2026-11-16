/** Tiny dependency-free SVG charts for the dashboard. Server-renderable. */

function path(values: number[], w: number, h: number, pad = 2): { line: string; area: string; lastX: number; lastY: number } {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [pad + i * step, h - pad - ((v - min) / span) * (h - pad * 2)] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = pts[pts.length - 1] ?? [0, h];
  return { line, area: `${line} L${lastX.toFixed(1)},${h} L${pad},${h} Z`, lastX, lastY };
}

export function AreaChart({ values, className, labelFirst, labelLast }: { values: number[]; className?: string; labelFirst?: string; labelLast?: string }) {
  const w = 640;
  const h = 180;
  const { line, area, lastX, lastY } = path(values, w, h, 6);
  const max = Math.max(...values, 1);
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label="Supporters over the last 30 days">
        <defs>
          <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f45d48" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f45d48" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 6" />
        ))}
        <path d={area} fill="url(#area-fill)" />
        <path d={line} fill="none" stroke="#f45d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r="5" fill="#f45d48" />
        <circle cx={lastX} cy={lastY} r="10" fill="#f45d48" fillOpacity="0.2" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{labelFirst ?? "30 days ago"}</span>
        <span className="tabular-nums">{max} {max === 1 ? "supporter" : "supporters"}</span>
        <span>{labelLast ?? "Today"}</span>
      </div>
    </div>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 120;
  const h = 36;
  const cumulative = values.reduce<number[]>((acc, v) => [...acc, (acc[acc.length - 1] ?? 0) + v], []);
  const { line, area } = path(cumulative, w, h, 2);
  const flat = cumulative[cumulative.length - 1] === 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      {!flat && <path d={area} fill="#f45d48" fillOpacity="0.12" />}
      <path
        d={line}
        fill="none"
        stroke={flat ? "currentColor" : "#f45d48"}
        strokeOpacity={flat ? 0.2 : 1}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
