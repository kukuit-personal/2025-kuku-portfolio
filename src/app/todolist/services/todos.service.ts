import { FilterMode, Todo } from '../types'

export async function listTodos(filters: FilterMode, skip = 0, take = 10) {
  const qs = new URLSearchParams()
  // BẮT BUỘC chỉ lấy todo gốc
  qs.set('parentId', '__root__')

  // status mặc định
  qs.set('status', 'active')

  // paging + sort mặc định
  qs.set('skip', String(skip))
  qs.set('take', String(take))
  qs.set('order', 'dueAt')
  qs.set('dir', 'asc')

  // áp filter
  if (filters.states?.length) qs.set('state', filters.states.join(','))
  if (filters.categories !== 'all') qs.set('category', (filters.categories as string[]).join(','))
  if (filters.priorities !== 'all') qs.set('priority', (filters.priorities as string[]).join(','))

  const res = await fetch(`/api/todos?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load todos')
  return res.json()
}

export async function listSubtasks(parentId: string, filters?: FilterMode) {
  const qs = new URLSearchParams()
  qs.set('status', 'active')
  qs.set('parentId', parentId)
  qs.set('order', 'dueAt')
  qs.set('dir', 'asc')

  // Áp dụng cùng filter như todo gốc
  if (filters) {
    if (filters.states?.length) qs.set('state', filters.states.join(','))
    if (filters.categories !== 'all') qs.set('category', (filters.categories as string[]).join(','))
    if (filters.priorities !== 'all') qs.set('priority', (filters.priorities as string[]).join(','))
  }

  const res = await fetch(`/api/todos?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load subtasks')
  return res.json()
}

export async function createTodo(data: Partial<Todo>) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create todo')
  return res.json()
}

export async function updateTodo(id: string, data: Partial<Todo>) {
  const res = await fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update todo')
  return res.json()
}

export async function deleteTodo(id: string) {
  const res = await fetch(`/api/todos/${id}/delete`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to delete todo')
  return res.json()
}
