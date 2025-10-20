'use client'

import { useMemo, useState } from 'react'
import { EllipsisVerticalIcon, PlusIcon } from './icons'
import { Todo, PRIOS } from '../types'
import { priorityBgText } from '../utils/priorityColor'

// Form nhỏ tạo subtask
type SubForm = { title: string; dueAt: string; priority: Todo['priority'] }

type Props = {
  item: Todo
  subtasks: Todo[]
  subFormOpen: boolean
  onOpenSubForm: (open: boolean) => void
  onOpenEdit: (it: Todo) => void
  onDelete: (id: string) => void
  onCreateSub: (p: SubForm) => Promise<void>
}

export function TodoCard({
  item,
  subtasks,
  subFormOpen,
  onOpenSubForm,
  onOpenEdit,
  onDelete,
  onCreateSub,
}: Props) {
  const [subForm, setSubForm] = useState<SubForm>({
    title: '',
    dueAt: '',
    priority: 'normal',
  })
  const [savingSub, setSavingSub] = useState(false)

  const dueStr = useMemo(() => (item.dueAt ? `Due ${item.dueAt}` : ''), [item.dueAt])

  async function handleCreateSub() {
    if (!subForm.title.trim()) return
    try {
      setSavingSub(true)
      await onCreateSub(subForm)
      setSubForm({ title: '', dueAt: '', priority: 'normal' })
      onOpenSubForm(false)
    } finally {
      setSavingSub(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4 sm:p-5 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base sm:text-lg font-semibold leading-snug line-clamp-1">
          {item.title}
        </h3>

        <div className="flex items-center gap-1">
          <button
            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
            onClick={() => onOpenEdit(item)}
            title="Edit"
          >
            Edit
          </button>
          <button
            className="text-xs px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => onDelete(item.id)}
            title="Delete"
          >
            Delete
          </button>

          <button
            className="shrink-0 text-gray-500 hover:text-gray-700"
            title="More actions"
            onClick={(e) => {
              e.stopPropagation()
              // giữ chỗ cho menu nếu bạn đang có
            }}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {item.description ? (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
      ) : null}

      {/* Badges: Category, State, Due, Priority */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {item.category ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-medium">
            {item.category}
          </span>
        ) : null}

        {item.state ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-medium">
            {/* bạn có thể có label mapping ở nơi khác, ở đây dùng raw */}
            {item.state.replace('_', ' ')}
          </span>
        ) : null}

        {dueStr ? (
          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-2.5 py-0.5 text-xs font-medium">
            {dueStr}
          </span>
        ) : null}

        {/* PRIORITY chip (màu theo util) */}
        {item.priority ? (
          <span
            className={[
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              priorityBgText(item.priority),
            ].join(' ')}
          >
            {item.priority[0].toUpperCase() + item.priority.slice(1)}
          </span>
        ) : null}
      </div>

      {/* Subtasks */}
      {subtasks?.length ? (
        <div className="mt-2 space-y-2">
          {subtasks.map((st) => (
            <div
              key={st.id}
              className="rounded-md border bg-gray-50 px-3 py-2 text-sm flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium line-clamp-1">{st.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-2 py-0.5">
                    {st.priority}
                  </span>
                  {st.state ? (
                    <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-2 py-0.5">
                      {st.state.replace('_', ' ')}
                    </span>
                  ) : null}
                  {st.dueAt ? (
                    <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-800 px-2 py-0.5">
                      {st.dueAt}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No subtasks.</p>
      )}

      {/* Add subtask */}
      <div className="mt-3">
        {!subFormOpen ? (
          <button
            onClick={() => onOpenSubForm(true)}
            className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border hover:bg-gray-50"
          >
            <PlusIcon className="w-4 h-4" /> Add subtask
          </button>
        ) : (
          <div className="rounded-md border bg-gray-50 p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                className="rounded border px-2 py-1 text-sm"
                placeholder="Title"
                value={subForm.title}
                onChange={(e) => setSubForm((s) => ({ ...s, title: e.target.value }))}
              />
              <input
                type="date"
                className="rounded border px-2 py-1 text-sm"
                value={subForm.dueAt}
                onChange={(e) => setSubForm((s) => ({ ...s, dueAt: e.target.value }))}
              />
              <select
                className="rounded border px-2 py-1 text-sm"
                value={subForm.priority}
                onChange={(e) =>
                  setSubForm((s) => ({ ...s, priority: e.target.value as Todo['priority'] }))
                }
              >
                {PRIOS.map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                className="px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
                onClick={() => onOpenSubForm(false)}
                disabled={savingSub}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded border border-green-600 bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 text-sm"
                onClick={handleCreateSub}
                disabled={savingSub}
              >
                {savingSub ? 'Saving…' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
