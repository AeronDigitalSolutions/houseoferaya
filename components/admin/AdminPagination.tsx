"use client";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  currentCount: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  currentCount,
  onPageChange,
  itemLabel = "items"
}: AdminPaginationProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = start + currentCount - 1;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-4">
      <p className="text-sm text-stone-600">
        Showing <span className="font-semibold text-stone-900">{start}</span>-
        <span className="font-semibold text-stone-900">{end}</span> of{" "}
        <span className="font-semibold text-stone-900">{totalItems}</span> {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>

        {visiblePages.map((pageNumber, index) => {
          const previous = visiblePages[index - 1];
          const showGap = previous && pageNumber - previous > 1;

          return (
            <div key={pageNumber} className="flex items-center gap-2">
              {showGap ? <span className="text-sm text-stone-400">...</span> : null}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`min-w-9 rounded-full px-3 py-1.5 text-sm transition ${
                  pageNumber === page
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {pageNumber}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
