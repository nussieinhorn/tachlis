export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-14" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-12 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 pt-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
