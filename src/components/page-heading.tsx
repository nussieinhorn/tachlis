/** The title block at the top of the Issues and Communities pages. */
export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      <h1 className="type-title">{title}</h1>
      <p className="max-w-xl text-base text-muted-foreground">{subtitle}</p>
    </header>
  );
}
