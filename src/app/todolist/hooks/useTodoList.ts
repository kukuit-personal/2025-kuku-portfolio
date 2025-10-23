'use client'

import { useCallback, useEffect, useState } from 'react'
import { FilterMode, Todo } from '../types'
import {
  listTodos,
  listSubtasks,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../services/todos.service'

export function useTodoList() {
  const [items, setItems] = useState<Todo[]>([])
  const [subtasks, setSubtasks] = useState<Record<string, Todo[]>>({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<FilterMode>({
    states: ['todo', 'in_progress'],
    categories: 'all',
    priorities: 'all',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState<Partial<Todo>>({
    title: '',
    description: '',
    category: 'Personal',
    priority: 'normal',
    state: 'todo',
    dueAt: '',
  })
  const [creating, setCreating] = useState(false)

  const [editing, setEditing] = useState<Todo | null>(null)
  const [editForm, setEditForm] = useState<Partial<Todo>>({})
  const [updating, setUpdating] = useState(false)

  // Sub-form open state theo map để hợp với TodoFeed hiện tại
  const [subFormOpen, setSubFormOpen] = useState<Record<string, boolean>>({})

  // ===== Prefetch subtasks cho danh sách todo gốc =====
  const prefetchSubtasksFor = useCallback(
    async (list: Todo[]) => {
      if (!list?.length) return
      await Promise.allSettled(
        list.map(async (it) => {
          try {
            const data = await listSubtasks(it.id, filters) // chỉ lấy sub theo filter
            setSubtasks((m) => ({ ...m, [it.id]: data.items ?? [] }))
          } catch {
            setSubtasks((m) => ({ ...m, [it.id]: [] }))
          }
        })
      )
    },
    [filters]
  )

  // ===== Fetch todo gốc (không có parent) =====
  const fetchList = useCallback(async () => {
    setIsLoading(true)
    try {
      const skip = (page - 1) * pageSize
      // listTodos() đã cố định parentId=__root__
      const data = await listTodos(filters, skip, pageSize)
      const roots: Todo[] = data.items ?? []
      setItems(roots)
      setTotal(data.total ?? 0)

      // load subtasks cho từng root
      await prefetchSubtasksFor(roots)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, pageSize, prefetchSubtasksFor])

  useEffect(() => {
    // đổi filter/page ⇒ reset cache subtasks để tránh “hiện nhầm”
    setSubtasks({})
    fetchList()
  }, [fetchList])

  // ===== Create todo root =====
  async function onCreateRoot() {
    if (!form.title?.trim()) return alert('Title is required')
    try {
      setCreating(true)
      await createTodo(form)
      setForm({
        title: '',
        description: '',
        category: 'Personal',
        priority: 'normal',
        state: 'todo',
        dueAt: '',
      })
      await fetchList()
    } catch (e: any) {
      alert(e?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  // ===== Load subtasks của 1 parent (khi mở form con chẳng hạn) =====
  async function loadSub(parentId: string) {
    try {
      const data = await listSubtasks(parentId, filters)
      setSubtasks((m) => ({ ...m, [parentId]: data.items ?? [] }))
    } catch (e: any) {
      alert(e?.message || 'Load subtasks failed')
    }
  }

  // ===== Create subtask =====
  async function onCreateSub(parentId: string, sub: Partial<Todo>) {
    if (!sub.title?.trim()) return alert('Title required')
    try {
      await createTodo({ ...sub, parentId })
      await loadSub(parentId) // reload sub sau khi tạo
    } catch (e: any) {
      alert(e?.message || 'Create subtask failed')
    }
  }

  // ===== Edit / Update =====
  function openEdit(todo: Todo, fmtDateInput: (d?: string | null) => string) {
    setEditing(todo)
    setEditForm({
      ...todo,
      dueAt: fmtDateInput(todo.dueAt),
    })
  }

  async function onUpdate() {
    if (!editing) return
    try {
      setUpdating(true)
      await updateTodo(editing.id, editForm)
      setEditing(null)
      await fetchList()
    } catch (e: any) {
      alert(e?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  // ===== Delete (soft) =====
  async function onDelete(todo: Todo) {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTodo(todo.id)
      await fetchList()
    } catch (e: any) {
      alert(e?.message || 'Delete failed')
    }
  }

  return {
    // States
    items,
    subtasks,
    total,
    page,
    pageSize,
    filters,
    addOpen,
    form,
    creating,
    editing,
    editForm,
    updating,
    isLoading,
    subFormOpen,

    // Setters
    setFilters,
    setPage,
    setPageSize,
    setAddOpen,
    setForm,
    setEditing,
    setEditForm,
    setSubFormOpen,

    // Actions
    onCreateRoot,
    onUpdate,
    onDelete,
    onCreateSub,
    openEdit,
    loadSub,
  }
}
