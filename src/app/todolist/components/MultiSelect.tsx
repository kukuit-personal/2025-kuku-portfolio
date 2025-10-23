'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type Option = { value: string; label: string }
export type MultiValue = string[] | 'all'

export function MultiSelect({
  placeholder = 'Select…',
  options,
  value,
  onChange,
  allEnabled = false,
  allLabel = 'All',
  maxHeight = 240,
}: {
  placeholder?: string
  options: Option[]
  value: MultiValue
  onChange: (v: MultiValue) => void
  allEnabled?: boolean
  allLabel?: string
  maxHeight?: number
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return qq ? options.filter((o) => o.label.toLowerCase().includes(qq)) : options
  }, [q, options])

  const isAll = value === 'all'
  const selected = Array.isArray(value) ? value : []
  const labelText = isAll
    ? allLabel
    : selected.length > 0
      ? `${selected.length} selected`
      : placeholder

  function toggle(v: string) {
    if (isAll) {
      onChange([v])
      return
    }
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])
  }

  function onToggleAll() {
    onChange(isAll ? [] : 'all')
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (!btnRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  return (
    <div className="relative w-full text-left">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-w-0 inline-flex items-center justify-between gap-2 px-3 py-2 rounded-md border bg-white text-sm hover:bg-gray-50"
      >
        <span
          className={(isAll || selected.length ? 'text-gray-900' : 'text-gray-400') + ' truncate'}
        >
          {labelText}
        </span>
        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="currentColor" d="m7 10l5 5l5-5H7z" />
        </svg>
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute z-20 mt-1 w-full left-0 right-0 rounded-md border bg-white shadow-lg"
        >
          <div className="p-2 border-b">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          {allEnabled && (
            <label className="flex items-center gap-2 px-3 py-2 text-sm border-b cursor-pointer">
              <input type="checkbox" checked={isAll} onChange={onToggleAll} />
              <span className="select-none">{allLabel}</span>
            </label>
          )}

          <div className="py-1 overflow-auto" style={{ maxHeight }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((opt) => {
                const checked = isAll ? false : selected.includes(opt.value)
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isAll}
                      onChange={() => toggle(opt.value)}
                    />
                    <span className="select-none">{opt.label}</span>
                  </label>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-2 px-2 py-2 border-t">
            <button
              onClick={() => onChange([])}
              className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-md border bg-indigo-500 text-white text-sm hover:bg-indigo-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
