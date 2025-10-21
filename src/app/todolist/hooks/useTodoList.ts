'use client'

import { useCallback, useEffect, useState } from 'react'
import { FilterMode, Status, Todo, TodoPriority, TodoState, TodoCategory } from '../types'
import {
  buildQueryRoot,
  createSubTask,
  createTodo as apiCreate,
  deleteTodo as apiDelete,
  listSubtasks,
  listTodos,
  updateTodo as apiUpdate,
} from '../services/todos.service'

// Form type
type FormState = {
  title: string
  description: string
  category: TodoCategory
  priority: TodoPriority
  state: TodoState
  dueAt: string
}

export function useTodoList() {
  // ===== Filters + pagination =====
  const [filters, setFilters] = useState<FilterMode>({
    states: ['todo', 'in_progress'],
    categories: 'all',
    priorities: 'all',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25) // default 25

  // ===== List state =====
  const [items, setItems] = useState<Todo[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // ===== Subtasks cache / inline forms =====
  const [subtasks, setSubtasks] = useState<Record<string, Todo[]>>({})
  const [subFormOpen, setSubFormOpen] = useState<Record<string, boolean>>({})

  // (nếu còn dùng chỗ khác)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // ===== Add form visibility =====
  const [addOpen, setAddOpen] = useState(false)

  // ===== Create form (parentId = null) =====
  const initialForm: FormState = {
    title: '',
    description: '',
    category: 'Other',
    priority: 'normal',
    state: 'todo',
    dueAt: '',
  }
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)

  // ===== Edit modal =====
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

  // ===== Helpers =====
  const prefetchSubtasksFor = useCallback(async (list: Todo[]) => {
    if (!list?.length) return
    await Promise.allSettled(
      list.map(async (it) => {
        try {
          const data = await listSubtasks(it.id)
          setSubtasks((m) => ({ ...m, [it.id]: data.items ?? [] }))
        } catch {
          setSubtasks((m) => ({ ...m, [it.id]: [] }))
        }
      })
    )
  }, [])

  const fetchList = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = buildQueryRoot(page, pageSize, filters)
      const data = await listTodos(url)
      const batch = data.items ?? []
      setTotal(data.total ?? 0)
      setItems(batch)
      await prefetchSubtasksFor(batch)
    } catch (e: any) {
      alert(e?.message || 'Load failed')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, filters, prefetchSubtasksFor])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  // ===== Page size helper (reset về trang 1) =====
  function onChangePageSize(n: number) {
    setPage(1)
    setPageSize(n)
  }

  // ===== Load subtasks cho 1 parent =====
  async function loadSub(parentId: string) {
    try {
      const data = await listSubtasks(parentId)
      setSubtasks((m) => ({ ...m, [parentId]: data.items ?? [] }))
    } catch (e: any) {
      alert(e?.message || 'Load subtasks failed')
      setSubtasks((m) => ({ ...m, [parentId]: [] }))
    }
  }

  // ===== Actions =====
  async function onCreateRoot() {
    if (creating) return
    if (!form.title.trim()) {
      alert('Title is required')
      return
    }
    setCreating(true)
    try {
      await apiCreate({
        title: form.title.trim(),
        description: form.description || null,
        category: form.category,
        priority: form.priority,
        state: form.state,
        dueAt: form.dueAt || null,
      } as any)

      setForm(initialForm)
      setPage(1)
      await fetchList()
      setAddOpen(false)
    } catch (e: any) {
      alert(e?.message || 'Cannot create')
    } finally {
      setCreating(false)
    }
  }

  function openEdit(item: Todo, fmtDateInput: (d?: string | null) => string) {
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

  async function onUpdate() {
    if (!editing || updating) return
    setUpdating(true)
    try {
      await apiUpdate(editing.id, {
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category,
        priority: editForm.priority,
        state: editForm.state,
        dueAt: editForm.dueAt || null,
        status: editForm.status,
      } as any)
      setEditing(null)
      await fetchList()
    } catch (e: any) {
      alert(e?.message || 'Cannot update')
    } finally {
      setUpdating(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this todo? (soft delete)')) return
    try {
      await apiDelete(id)
      // tính lại page nếu cần
      const newTotal = total - 1
      const maxPage = Math.max(1, Math.ceil(newTotal / pageSize))
      const nextPage = Math.min(page, maxPage)
      if (nextPage !== page) setPage(nextPage)
      await fetchList()
    } catch (e: any) {
      alert(e?.message || 'Cannot delete')
    }
  }

  // === Subtask: tạo có state ===
  async function onCreateSub(
    parentId: string,
    data: { title: string; dueAt: string; priority: TodoPriority; state: TodoState }
  ) {
    try {
      await createSubTask(parentId, data)
      await loadSub(parentId)
      setSubFormOpen((m) => ({ ...m, [parentId]: false }))
      setExpanded((m) => ({ ...m, [parentId]: true }))
    } catch (e: any) {
      alert(e?.message || 'Cannot create sub-task')
    }
  }

  // ===== Expose =====
  return {
    // filters + paging
    filters,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize, // vẫn export
    onChangePageSize, // dùng cho FiltersBar

    // list
    items,
    total,
    isLoading,

    // subtasks & inline forms
    subtasks,
    setSubtasks,
    subFormOpen,
    setSubFormOpen,

    expanded,
    setExpanded,

    // add form
    addOpen,
    setAddOpen,

    // create
    creating,
    form,
    setForm,
    onCreateRoot,

    // edit
    editing,
    setEditing,
    editForm,
    setEditForm,
    updating,
    openEdit,
    onUpdate,

    // actions
    onDelete,

    // sub create/load
    onCreateSub,
    loadSub,

    // manual reload
    fetchList,
  }
}
