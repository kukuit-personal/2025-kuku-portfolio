'use client'

import { useState } from 'react'
import { PRIOS, TodoPriority } from '../types'
import { Spinner } from './Spinner'
import { PlusIcon } from './icons'

export function SubForm({
  onCreate,
  onCancel,
}: {
  onCreate: (p: { title: string; dueAt: string; priority: TodoPriority }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('normal')
  const [saving, setSaving] = useState(false)

  return (
    <div className="rounded border p-2 bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="col-span-3">
          <label className="block text-[11px] text-gray-600 mb-1">Sub-todo title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-2 py-1 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] text-gray-600 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="w-full rounded-md border px-2 py-1 text-sm"
          >
            {PRIOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-[11px] text-gray-600 mb-1">Due</label>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full rounded-md border px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1 rounded-md border hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={async () => {
            if (!title.trim()) {
              alert('Title is required')
              return
            }
            if (saving) return
            setSaving(true)
            await onCreate({ title: title.trim(), dueAt, priority })
            setSaving(false)
            setTitle('')
            setDueAt('')
            setPriority('normal')
          }}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-600 bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60"
        >
          {saving ? <Spinner className="w-4 h-4 text-white" /> : <PlusIcon />}
          <span>{saving ? 'Saving...' : 'Add sub-todo'}</span>
        </button>
      </div>
    </div>
  )
}
