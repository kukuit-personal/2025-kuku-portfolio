'use client'

export function Pagination({
  total,
  page,
  pageSize,
  setPage, // giữ để không breaking, nhưng không dùng
}: {
  total: number
  page: number
  pageSize: number
  setPage: (n: number) => void
}) {
  const loaded = Math.min(page * pageSize, total)
  const start = total > 0 ? 1 : 0
  const end = loaded
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  const percent = total > 0 ? Math.round((loaded / total) * 100) : 0

  return (
    <div className="rounded-md border bg-white p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-sm text-gray-700">
          {total > 0 ? (
            <>
              Showing{' '}
              <strong>
                {start}–{end}
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

        <div className="min-w-[160px]">
          <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${percent}%` }}
              aria-label="Loaded percent"
            />
          </div>
          <div className="mt-1 text-[11px] text-gray-500 text-right">{percent}% loaded</div>
        </div>
      </div>
    </div>
  )
}
