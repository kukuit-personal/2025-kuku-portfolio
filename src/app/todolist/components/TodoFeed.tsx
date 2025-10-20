'use client'

import { Todo } from '../types'
import { TodoCard } from './TodoCard'

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
}: {
  items: Todo[]
  subtasksMap: Record<string, Todo[]>
  subFormOpen: Record<string, boolean>
  setSubFormOpen: (u: (m: Record<string, boolean>) => Record<string, boolean>) => void
  onOpenEdit: (t: Todo) => void
  onDelete: (id: string) => void
  onCreateSub: (
    parentId: string,
    p: { title: string; dueAt: string; priority: Todo['priority'] }
  ) => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
}) {
  return (
    <>
      {/* Tối đa 2 card / hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {items.map((it) => (
          <TodoCard
            key={it.id}
            item={it}
            subtasks={subtasksMap[it.id] ?? []}
            subFormOpen={!!subFormOpen[it.id]}
            onOpenSubForm={(open) => setSubFormOpen((m) => ({ ...m, [it.id]: open }))}
            onOpenEdit={onOpenEdit}
            onDelete={onDelete}
            onCreateSub={(p) => onCreateSub(it.id, p)}
          />
        ))}
      </div>

      <div className="flex justify-center mt-5">
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50"
          >
            Load more
          </button>
        )}
      </div>
    </>
  )
}
