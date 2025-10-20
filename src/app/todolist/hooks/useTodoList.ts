'use client'

import { useEffect, useState } from 'react'
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

// Form type rõ ràng để TS không suy luận sai
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
  const [pageSize, setPageSize] = useState(10)

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

  // ===== Row menu =====
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

  // ===== Prefetch subtasks ngay khi load =====
  async function prefetchSubtasksFor(list: Todo[]) {
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
  }

  // ===== Load root list =====
  async function load() {
    setIsLoading(true)
    try {
      const url = buildQueryRoot(page, pageSize, filters)
      const data = await listTodos(url)
      const list = data.items ?? []
      setItems(list)
      setTotal(data.total ?? 0)
      await prefetchSubtasksFor(list)
    } catch (e: any) {
      alert(e?.message || 'Load failed')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters])

  // ===== Load subtasks cho 1 parent (khi thêm sub xong) =====
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
      await load()
      setAddOpen(false) // đóng form sau khi tạo xong
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
      await load()
    } catch (e: any) {
      alert(e?.message || 'Cannot update')
    } finally {
      setUpdating(false)
    }
  }

  async function onDelete(id: string) {
    setMenuOpenId(null)
    if (!confirm('Delete this todo? (soft delete)')) return
    try {
      await apiDelete(id)
      await load()
    } catch (e: any) {
      alert(e?.message || 'Cannot delete')
    }
  }

  async function onCreateSub(
    parentId: string,
    data: { title: string; dueAt: string; priority: TodoPriority }
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
    setPageSize,

    // list
    items,
    total,
    isLoading,

    // subtasks & inline forms
    subtasks,
    setSubtasks,
    subFormOpen,
    setSubFormOpen,

    // (expanded nếu còn dùng)
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
    menuOpenId,
    setMenuOpenId,
    onDelete,

    // sub create/load
    onCreateSub,
    loadSub,

    // manual reload
    load,
  }
}
