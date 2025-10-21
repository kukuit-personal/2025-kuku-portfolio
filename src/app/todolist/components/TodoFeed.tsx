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
  subFormOpen: Record<string, boolean>
  setSubFormOpen: (u: (m: Record<string, boolean>) => Record<string, boolean>) => void
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
            subtasks={subtasksMap[it.id] ?? []}
            isSubFormOpen={!!subFormOpen[it.id]}
            onToggleSubForm={(_, open) =>
              setSubFormOpen((m) => ({ ...m, [it.id]: open ?? !m[it.id] }))
            }
            onOpenEdit={onOpenEdit}
            onDelete={onDelete}
            onCreateSub={(parentId, payload) => onCreateSub(parentId, payload)}
          />
        ))}
      </div>
    </>
  )
}
