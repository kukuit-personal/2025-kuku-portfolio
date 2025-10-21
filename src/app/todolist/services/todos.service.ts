import { FilterMode, Todo, TodoPriority, TodoState } from '../types'

export type ListResponse = { items: Todo[]; total: number }

export function buildQueryRoot(page: number, pageSize: number, filters: FilterMode) {
  const qs = new URLSearchParams()
  qs.set('status', 'active')
  qs.set('parentId', '__root__')
  qs.set('skip', String((page - 1) * pageSize))
  qs.set('take', String(pageSize))
  qs.set('order', 'dueAt')
  qs.set('dir', 'asc')

  // multiple states
  if (filters.states.length > 0) {
    qs.set('state', filters.states.join(','))
  }

  // categories/priorities allow 'all'
  if (filters.categories !== 'all' && filters.categories.length > 0) {
    qs.set('category', filters.categories.join(','))
  }
  if (filters.priorities !== 'all' && filters.priorities.length > 0) {
    qs.set('priority', filters.priorities.join(','))
  }

  return `/api/todos?${qs.toString()}`
}

export async function listTodos(url: string): Promise<ListResponse> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
  return res.json()
}

export async function listSubtasks(parentId: string): Promise<ListResponse> {
  const qs = new URLSearchParams()
  qs.set('status', 'active')
  qs.set('parentId', parentId)
  qs.set('order', 'dueAt')
  qs.set('dir', 'asc')
  const res = await fetch(`/api/todos?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Load subtasks failed')
  return res.json()
}

export async function createTodo(payload: {
  title: string
  description?: string | null
  category: string
  priority: string
  state: TodoState
  dueAt?: string | null
  parentId?: string | null
}) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Cannot create')
  }
}

export async function updateTodo(id: string, payload: Partial<Todo>) {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Cannot update')
  }
}

export async function deleteTodo(id: string) {
  const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Cannot delete')
  }
}

// === CẬP NHẬT: thêm `state` cho tạo subtask ===
export async function createSubTask(
  parentId: string,
  data: { title: string; dueAt: string; priority: TodoPriority; state: TodoState }
) {
  return createTodo({
    title: data.title.trim(),
    dueAt: data.dueAt || null,
    parentId,
    priority: data.priority,
    state: data.state ?? 'todo',
    // giữ nguyên category mặc định ở backend (nếu backend set), không truyền ở đây
  } as any)
}
