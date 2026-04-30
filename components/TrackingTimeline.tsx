import type { TimelineEvent } from "@/lib/types";

export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <div className="pt-1">
            <span
              className={`block h-3 w-3 rounded-full ${event.isCompleted ? "bg-emerald-500" : "bg-stone-300"}`}
              aria-hidden
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-900">{event.title}</p>
            <p className="text-xs text-stone-600">{event.description}</p>
            <p className="text-xs text-stone-500">{event.timestamp}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
