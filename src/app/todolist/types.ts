export type Status = 'active' | 'disabled'
export type TodoState =
  | 'todo'
  | 'in_progress'
  | 'waiting'
  | 'blocked'
  | 'done'
  | 'canceled'
  | 'archived'
export type TodoPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
export type TodoCategory = 'Ainka' | 'Kuku' | 'Freelancer' | 'Personal' | 'Learning' | 'Other'

export type Todo = {
  id: string
  title: string
  description?: string | null
  labels?: string[]
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

// Multi-select filters
export type MultiFilter<T> = T[] | 'all'
export type FilterMode = {
  states: TodoState[] // mặc định: ['todo','in_progress']
  categories: MultiFilter<TodoCategory> // mặc định: 'all'
  priorities: MultiFilter<TodoPriority> // mặc định: 'all'
}

export const STATES: TodoState[] = [
  'todo',
  'in_progress',
  'waiting',
  'blocked',
  'done',
  'canceled',
  'archived',
]
export const CATES: TodoCategory[] = [
  'Ainka',
  'Kuku',
  'Freelancer',
  'Personal',
  'Learning',
  'Other',
]
export const PRIOS: TodoPriority[] = ['low', 'normal', 'high', 'urgent', 'critical']
