'use client'

import { useEffect, useMemo, useState } from 'react'

// ===== Types =====
type Status = 'active' | 'disabled'
type TodoState = 'todo' | 'in_progress' | 'waiting' | 'blocked' | 'done' | 'canceled' | 'archived'
type TodoPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
type TodoCategory = 'Ainka' | 'Kuku' | 'Freelancer' | 'Personal' | 'Learning' | 'Other'

type Todo = {
  id: string
  title: string
  description?: string | null
  labels?: string[] // optional on client
  category: TodoCategory
  priority: TodoPriority
  state: TodoState
  dueAt?: string | null
  startedAt?: string | null
  completedAt?: string | null
  canceledAt?: string | null
  estimateMin?: number | null
  spentMin?: number | null
  waitingOn?: string | null
  parentId?: string | null
  sortOrder?: number | null
  status: Status
  createdAt: string
  updatedAt: string
}

type FilterMode = {
  state: TodoState | 'all'
  category: TodoCategory | 'all'
  priority: TodoPriority | 'all'
}

// ===== Helpers =====
function fmtDateInput(dt?: string | null) {
  if (!dt) return ''
  const d = new Date(dt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function parseDateOrNull(v?: string) {
  return v ? new Date(v).toISOString() : null
}
const STATES: TodoState[] = [
  'todo',
  'in_progress',
  'waiting',
  'blocked',
  'done',
  'canceled',
  'archived',
]
const CATES: TodoCategory[] = ['Ainka', 'Kuku', 'Freelancer', 'Personal', 'Learning', 'Other']
const PRIOS: TodoPriority[] = ['low', 'normal', 'high', 'urgent', 'critical']

// ===== Page =====
export default function TodoPage() {
  // Filters + pagination
  const [filters, setFilters] = useState<FilterMode>({
    state: 'all',
    category: 'all',
    priority: 'all',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // List state
  const [items, setItems] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Expand cache for subtasks
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [subtasks, setSubtasks] = useState<Record<string, Todo[]>>({})
  const [subFormOpen, setSubFormOpen] = useState<Record<string, boolean>>({})

  // Create form (parentId null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other' as TodoCategory,
    priority: 'normal' as TodoPriority,
    state: 'todo' as TodoState,
    dueAt: '',
  })

  // Edit modal
  const [editing, setEditing] = useState<Todo | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'Other' as TodoCategory,
    priority: 'normal' as TodoPriority,
    state: 'todo' as TodoState,
    dueAt: '',
    status: 'active' as Status,
  })
  const [updating, setUpdating] = useState(false)

  // Menu state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest?.('[data-row-menu]')) setMenuOpenId(null)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpenId(null)
        setEditing(null)
      }
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // Build list query
  function buildQueryRoot() {
    const qs = new URLSearchParams()
    qs.set('status', 'active')
    qs.set('parentId', '__root__')
    qs.set('skip', String((page - 1) * pageSize))
    qs.set('take', String(pageSize))
    qs.set('order', 'dueAt')
    qs.set('dir', 'asc')
    if (filters.state !== 'all') qs.set('state', filters.state)
    if (filters.category !== 'all') qs.set('category', filters.category)
    if (filters.priority !== 'all') qs.set('priority', filters.priority)
    return `/api/todos?${qs.toString()}`
  }
  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch(buildQueryRoot(), { cache: 'no-store' })
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      alert((e as Error).message || 'Load failed')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state, filters.category, filters.priority, page, pageSize])

  // Load subtasks for a parent
  async function loadSubtasks(parentId: string) {
    try {
      const qs = new URLSearchParams()
      qs.set('status', 'active')
      qs.set('parentId', parentId)
      qs.set('order', 'dueAt')
      qs.set('dir', 'asc')
      const res = await fetch(`/api/todos?${qs.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Load subtasks failed')
      const data = await res.json()
      setSubtasks((m) => ({ ...m, [parentId]: data.items ?? [] }))
    } catch (e) {
      alert((e as Error).message || 'Load subtasks failed')
      setSubtasks((m) => ({ ...m, [parentId]: [] }))
    }
  }

  // Actions
  async function createTodo() {
    if (creating) return
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }
    setCreating(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        category: form.category,
        priority: form.priority,
        state: form.state,
        dueAt: form.dueAt || null,
        // parentId omitted -> null
      }
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot create')
      }
      setForm({
        title: '',
        description: '',
        category: 'Other',
        priority: 'normal',
        state: 'todo',
        dueAt: '',
      })
      await load()
    } catch (e) {
      alert((e as Error).message || 'Cannot create')
    } finally {
      setCreating(false)
    }
  }

  function openEdit(item: Todo) {
    setEditing(item)
    setEditForm({
      title: item.title ?? '',
      description: item.description ?? '',
      category: item.category,
      priority: item.priority,
      state: item.state,
      dueAt: fmtDateInput(item.dueAt),
      status: item.status,
    })
  }
  async function updateTodo() {
    if (!editing || updating) return
    setUpdating(true)
    try {
      const payload: any = {
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category,
        priority: editForm.priority,
        state: editForm.state,
        dueAt: editForm.dueAt || null,
        status: editForm.status,
      }
      const res = await fetch(`/api/todos/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot update')
      }
      setEditing(null)
      await load()
    } catch (e) {
      alert((e as Error).message || 'Cannot update')
    } finally {
      setUpdating(false)
    }
  }
  async function deleteTodo(id: string) {
    setMenuOpenId(null)
    if (!confirm('Delete this todo? (soft delete)')) return
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot delete')
      }
      // nếu đang mở subtasks thì reload danh sách cha là đủ
      await load()
    } catch (e) {
      alert((e as Error).message || 'Cannot delete')
    }
  }

  // Sub-todo create
  async function createSub(
    parentId: string,
    data: { title: string; dueAt: string; priority: TodoPriority }
  ) {
    try {
      const payload = {
        title: data.title.trim(),
        dueAt: data.dueAt || null,
        parentId,
        priority: data.priority,
        state: 'todo' as TodoState,
      }
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot create sub-task')
      }
      await loadSubtasks(parentId)
      setSubFormOpen((m) => ({ ...m, [parentId]: false }))
      setExpanded((m) => ({ ...m, [parentId]: true }))
    } catch (e) {
      alert((e as Error).message || 'Cannot create sub-task')
    }
  }

  // ===== UI =====
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Todo List</h1>
      </div>

      {/* Create form (parentId=null) */}
      <div className="rounded-md border bg-white p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          <div className="col-span-3 sm:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div className="col-span-3 sm:col-span-3">
            <label className="block text-xs text-gray-600 mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional"
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TodoCategory }))}
              className="w-full rounded-md border px-2 py-1 text-sm"
            >
              {CATES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TodoPriority }))}
              className="w-full rounded-md border px-2 py-1 text-sm"
            >
              {PRIOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">State</label>
            <select
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value as TodoState }))}
              className="w-full rounded-md border px-2 py-1 text-sm"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Due date</label>
            <input
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={createTodo}
            disabled={creating}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-600 bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60"
          >
            {creating ? <Spinner className="w-4 h-4 text-white" /> : <PlusIcon />}
            <span>{creating ? 'Saving...' : 'Add todo'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Page size */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600">State:</label>
        <select
          value={filters.state}
          onChange={(e) => {
            setPage(1)
            setFilters((f) => ({ ...f, state: e.target.value as FilterMode['state'] }))
          }}
          className="px-2 py-1 rounded-md border text-sm"
        >
          <option value="all">All</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label className="text-sm text-gray-600 ml-2">Category:</label>
        <select
          value={filters.category}
          onChange={(e) => {
            setPage(1)
            setFilters((f) => ({ ...f, category: e.target.value as FilterMode['category'] }))
          }}
          className="px-2 py-1 rounded-md border text-sm"
        >
          <option value="all">All</option>
          {CATES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="text-sm text-gray-600 ml-2">Priority:</label>
        <select
          value={filters.priority}
          onChange={(e) => {
            setPage(1)
            setFilters((f) => ({ ...f, priority: e.target.value as FilterMode['priority'] }))
          }}
          className="px-2 py-1 rounded-md border text-sm"
        >
          <option value="all">All</option>
          {PRIOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <span className="hidden sm:inline-block w-px h-5 bg-gray-200 mx-1" />

        <label className="text-sm text-gray-600">Page size:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPage(1)
            setPageSize(Number(e.target.value))
          }}
          className="px-2 py-1 rounded-md border text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-left w-8"></th>
              <th className="px-3 sm:px-4 py-2 text-left">Title</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden lg:table-cell">Category</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden lg:table-cell">Priority</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">State</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Due</th>
              <th className="px-3 sm:px-4 py-2 text-right w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" /> Loading...
                  </span>
                </td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  No records.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((it, idx) => {
                const stripe = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                const rowTone = it.status === 'disabled' ? 'bg-gray-100 text-gray-500' : stripe
                const isOpen = !!expanded[it.id]
                const subs = subtasks[it.id] ?? []

                return (
                  <FragmentRows key={it.id}>
                    <tr className={['border-t', rowTone].join(' ')}>
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="w-7 h-7 inline-grid place-items-center rounded hover:bg-gray-100"
                          title={isOpen ? 'Collapse' : 'Expand'}
                          onClick={async () => {
                            setExpanded((m) => ({ ...m, [it.id]: !m[it.id] }))
                            if (!isOpen && !subtasks[it.id]) await loadSubtasks(it.id)
                          }}
                        >
                          {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 py-1">
                        <div className="font-medium">{it.title}</div>
                        {it.description ? (
                          <div className="text-xs text-gray-500">{it.description}</div>
                        ) : null}
                      </td>
                      <td className="px-3 sm:px-4 py-1 hidden lg:table-cell">{it.category}</td>
                      <td className="px-3 sm:px-4 py-1 hidden lg:table-cell">{it.priority}</td>
                      <td className="px-3 sm:px-4 py-1 hidden md:table-cell">{it.state}</td>
                      <td className="px-3 sm:px-4 py-1 hidden md:table-cell">
                        {fmtDateInput(it.dueAt) || ''}
                      </td>
                      <td
                        className="px-3 sm:px-4 py-1 text-right relative select-none"
                        data-row-menu
                      >
                        <button
                          type="button"
                          onClick={() => setMenuOpenId((v) => (v === it.id ? null : it.id))}
                          className="inline-grid place-items-center w-7 h-7 rounded hover:bg-gray-100"
                          aria-haspopup="menu"
                          aria-expanded={menuOpenId === it.id}
                          aria-label="Open row menu"
                        >
                          <DotsIcon />
                        </button>

                        {menuOpenId === it.id && (
                          <div
                            role="menu"
                            className="absolute right-2 bottom-8 z-20 w-40 rounded-md border bg-white shadow-lg py-1 text-sm"
                          >
                            <button
                              role="menuitem"
                              onClick={() => {
                                setMenuOpenId(null)
                                openEdit(it)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                            >
                              <EditIcon className="w-4 h-4" /> Edit
                            </button>
                            <button
                              role="menuitem"
                              onClick={() => deleteTodo(it.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                            <button
                              role="menuitem"
                              onClick={async () => {
                                setMenuOpenId(null)
                                setSubFormOpen((m) => ({ ...m, [it.id]: !m[it.id] }))
                                if (!subtasks[it.id]) await loadSubtasks(it.id)
                                setExpanded((m) => ({ ...m, [it.id]: true }))
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                            >
                              <PlusIcon className="w-4 h-4" /> Add sub-todo
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Sub-todos (indented) */}
                    {isOpen && (
                      <tr className={rowTone}>
                        <td></td>
                        <td className="px-3 sm:px-4 py-2" colSpan={5}>
                          <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                            {/* Sub form */}
                            {subFormOpen[it.id] && (
                              <SubForm
                                onCreate={async (payload) => await createSub(it.id, payload)}
                                onCancel={() => setSubFormOpen((m) => ({ ...m, [it.id]: false }))}
                              />
                            )}

                            {/* List subtasks */}
                            {subs.length === 0 ? (
                              <div className="text-xs text-gray-500">No subtasks.</div>
                            ) : (
                              <table className="w-full text-xs">
                                <thead className="hidden md:table-header-group">
                                  <tr className="text-gray-500">
                                    <th className="py-1 text-left">Title</th>
                                    <th className="py-1 text-left">Priority</th>
                                    <th className="py-1 text-left">State</th>
                                    <th className="py-1 text-left">Due</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subs.map((s, j) => (
                                    <tr key={s.id} className={j % 2 ? 'bg-gray-50' : 'bg-white'}>
                                      <td className="py-1 pr-2">
                                        <div className="font-medium">{s.title}</div>
                                        {s.description ? (
                                          <div className="text-[11px] text-gray-500">
                                            {s.description}
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="py-1 pr-2">{s.priority}</td>
                                      <td className="py-1 pr-2">{s.state}</td>
                                      <td className="py-1">{fmtDateInput(s.dueAt) || ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </FragmentRows>
                )
              })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 sm:px-4 py-3">
          <div className="text-sm text-gray-600">
            {total > 0 ? (
              <>
                Showing{' '}
                <strong>
                  {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)}
                </strong>{' '}
                of <strong>{total}</strong>
              </>
            ) : (
              'No records'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page <strong>{page}</strong> / {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              onClick={() => {
                const maxP = Math.max(1, Math.ceil(total / pageSize))
                setPage((p) => Math.min(p + 1, maxP))
              }}
              disabled={page >= Math.ceil(total / pageSize) || total === 0}
              className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-30 bg-black/30 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null)
          }}
        >
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Edit todo</h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 inline-grid place-items-center rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <input
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, category: e.target.value as TodoCategory }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                >
                  {CATES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, priority: e.target.value as TodoPriority }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                >
                  {PRIOS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">State</label>
                <select
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, state: e.target.value as TodoState }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Due date</label>
                <input
                  type="date"
                  value={editForm.dueAt}
                  onChange={(e) => setEditForm((f) => ({ ...f, dueAt: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Status }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateTodo}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60"
              >
                {updating ? <Spinner className="w-4 h-4 text-white" /> : <SaveIcon />}
                <span>{updating ? 'Saving...' : 'Save changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

// ===== Small components =====
function SubForm({
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

function FragmentRows({ children }: { children: React.ReactNode }) {
  // helper để return nhiều <tr> với 1 key
  return <>{children}</>
}

// ===== Icons & Spinner =====
function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4z" />
    </svg>
  )
}
function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
      <path
        fill="currentColor"
        d="M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
      />
    </svg>
  )
}
function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.51-2.51a.9959.9959 0 1 0-1.41 1.41l2.51 2.51c.4.39 1.03.39 1.41 0Z"
      />
    </svg>
  )
}
function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M9 3h6v2h5v2H4V5h5zm1 6h2v8h-2zm4 0h2v8h-2z" />
    </svg>
  )
}
function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  )
}
function SaveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
      />
    </svg>
  )
}
function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="m10 17l5-5l-5-5v10z" />
    </svg>
  )
}
function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="m7 10l5 5l5-5H7z" />
    </svg>
  )
}
