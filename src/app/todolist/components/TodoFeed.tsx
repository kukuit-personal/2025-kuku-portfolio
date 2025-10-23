'use client'

import { Todo } from '../types'
import TodoCard from './TodoCard'

export function TodoFeed({
  items,
  subtasksMap,
  subFormOpen,
  setSubFormOpen,
  onOpenEdit,
  onDelete,
  onCreateSub,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: {
  items: Todo[]
  subtasksMap: Record<string, Todo[]>
  subFormOpen: Record<string, boolean> | null | undefined
  setSubFormOpen: (
    u: (m: Record<string, boolean> | null | undefined) => Record<string, boolean>
  ) => void
  onOpenEdit: (t: Todo) => void
  onDelete: (id: string) => void
  onCreateSub: (
    parentId: string,
    p: { title: string; dueAt: string; priority: Todo['priority']; state: Todo['state'] }
  ) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
}) {
  return (
    <>
      {/* Tối đa 2 card / hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4">
        {items.map((it) => (
          <TodoCard
            key={it.id}
            item={it}
            subtasks={subtasksMap?.[it.id] ?? []}
            isSubFormOpen={!!subFormOpen?.[it.id]}
            onToggleSubForm={(_, open) =>
              setSubFormOpen((m) => {
                const base = m ?? {}
                return { ...base, [it.id]: open ?? !base[it.id] }
              })
            }
            onOpenEdit={onOpenEdit}
            onDelete={onDelete}
            onCreateSub={(parentId, payload) => onCreateSub(parentId, payload)}
          />
        ))}
      </div>

      {/* Load more (nếu dùng) */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-3 py-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-60"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
