export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="h-3 w-3 animate-pulse rounded-full bg-stone-400" />
      <p className="text-sm text-stone-600">{label}</p>
    </div>
  );
}
