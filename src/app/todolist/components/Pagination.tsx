'use client'

export function Pagination({
  total,
  page,
  pageSize,
  setPage,
}: {
  total: number
  page: number
  pageSize: number
  setPage: (n: number) => void
}) {
  const loadedStart = total > 0 ? (page - 1) * pageSize + 1 : 0
  const loadedEnd = Math.min(page * pageSize, total)
  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  const canPrev = page > 1
  const canNext = page < maxPage

  return (
    <div className="rounded-md border bg-white p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-700">
          {total > 0 ? (
            <>
              Showing{' '}
              <strong>
                {loadedStart}–{loadedEnd}
              </strong>{' '}
              of <strong>{total}</strong>
              <span className="ml-2 text-gray-500">
                | Page <strong>{page}</strong> / {maxPage}
              </span>
              <span className="ml-2 text-gray-500">
                | Size <strong>{pageSize}</strong>
              </span>
            </>
          ) : (
            'No records'
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => canPrev && setPage(page - 1)}
            disabled={!canPrev}
            className="px-3 py-1.5 rounded-md border text-sm bg-white disabled:opacity-60"
          >
            Prev
          </button>
          <button
            onClick={() => canNext && setPage(page + 1)}
            disabled={!canNext}
            className="px-3 py-1.5 rounded-md border text-sm bg-white disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
