'use client'

import { CATES, FilterMode, PRIOS, STATES, TodoCategory, TodoPriority, TodoState } from '../types'
import { MultiSelect, Option } from './MultiSelect'
import { useEffect, useMemo, useState } from 'react'

export function FiltersBar({
  filters,
  setFilters,
  pageSize,
  setPageSize,
  setPage,
}: {
  filters: FilterMode
  setFilters: (updater: any) => void
  pageSize: number
  setPageSize: (n: number) => void
  setPage: (n: number) => void
}) {
  // Local temp states để không auto load khi đổi
  const [states, setStates] = useState<TodoState[]>(filters.states)
  const [cateAll, setCateAll] = useState(filters.categories === 'all')
  const [categories, setCategories] = useState<TodoCategory[]>(
    filters.categories === 'all' ? [] : (filters.categories as TodoCategory[])
  )
  const [prioAll, setPrioAll] = useState(filters.priorities === 'all')
  const [priorities, setPriorities] = useState<TodoPriority[]>(
    filters.priorities === 'all' ? [] : (filters.priorities as TodoPriority[])
  )

  // Sync khi filters bên ngoài đổi
  useEffect(() => {
    setStates(filters.states)
    setCateAll(filters.categories === 'all')
    setCategories(filters.categories === 'all' ? [] : (filters.categories as TodoCategory[]))
    setPrioAll(filters.priorities === 'all')
    setPriorities(filters.priorities === 'all' ? [] : (filters.priorities as TodoPriority[]))
  }, [filters])

  const stateOpts: Option[] = useMemo(() => STATES.map((s) => ({ value: s, label: s })), [])
  const cateOpts: Option[] = useMemo(() => CATES.map((c) => ({ value: c, label: c })), [])
  const prioOpts: Option[] = useMemo(() => PRIOS.map((p) => ({ value: p, label: p })), [])

  function apply() {
    setPage(1)
    setFilters((f: FilterMode) => ({
      ...f,
      states,
      categories: cateAll ? 'all' : categories,
      priorities: prioAll ? 'all' : priorities,
    }))
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      {/* States */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">States</span>
        <MultiSelect
          placeholder="Select states"
          options={stateOpts}
          value={states}
          onChange={(v) => setStates(Array.isArray(v) ? (v as TodoState[]) : [])}
        />
      </div>

      {/* Categories (with All) */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Category</span>
        <MultiSelect
          placeholder="Select categories"
          options={cateOpts}
          value={cateAll ? 'all' : categories}
          onChange={(v) => {
            if (v === 'all') {
              setCateAll(true)
              setCategories([])
            } else {
              setCateAll(false)
              setCategories(v as TodoCategory[])
            }
          }}
          allEnabled
          allLabel="All"
        />
      </div>

      {/* Priorities (with All) */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Priority</span>
        <MultiSelect
          placeholder="Select priorities"
          options={prioOpts}
          value={prioAll ? 'all' : priorities}
          onChange={(v) => {
            if (v === 'all') {
              setPrioAll(true)
              setPriorities([])
            } else {
              setPrioAll(false)
              setPriorities(v as TodoPriority[])
            }
          }}
          allEnabled
          allLabel="All"
        />
      </div>

      <span className="hidden sm:inline-block w-px h-5 bg-gray-200" />

      {/* Page size + Apply */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page size</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPage(1)
            setPageSize(Number(e.target.value))
          }}
          className="px-3 py-1.5 rounded-md border text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <button
          onClick={apply}
          className="px-3 py-1.5 rounded-md border border-indigo-600 bg-indigo-500 text-white text-sm hover:bg-indigo-600"
        >
          Apply filters
        </button>
      </div>
    </div>
  )
}
