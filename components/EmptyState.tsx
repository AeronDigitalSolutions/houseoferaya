export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="card flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="font-heading text-2xl text-stone-900">{title}</h3>
      <p className="max-w-md text-sm text-stone-600">{description}</p>
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}
