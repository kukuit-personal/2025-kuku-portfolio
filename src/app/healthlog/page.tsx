'use client'

import { useEffect, useState } from 'react'

// ===== Types =====
type Status = 'active' | 'disabled'
type FilterMode = 'last7' | 'thisMonth' | 'all'

type HealthLog = {
  id: string
  date: string // YYYY-MM-DD
  weekday?: string | null
  weight?: string | null // Decimal -> nhận string
  morning?: string | null
  gym?: string | null
  afternoon?: string | null
  noEatAfter?: string | null
  calories?: number | null
  goutTreatment?: number | null
  status: Status
  createdAt: string
  updatedAt: string
}

// ===== Helpers =====
function toVNDateStr(date = new Date()) {
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  const y = tzDate.getFullYear()
  const m = String(tzDate.getMonth() + 1).padStart(2, '0')
  const d = String(tzDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function todayVN() {
  return toVNDateStr()
}
function shorten(s?: string | null, n = 18) {
  if (!s) return '-'
  return s.length > n ? s.slice(0, n) + '…' : s
}
function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split('-').map((v) => +v)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + delta)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
function monthStartEndOf(dateStr: string) {
  const [y, m] = dateStr.split('-').map(Number)
  const start = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate() // last day of month
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}
function weekdayOf(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' })
}
function kcalBgClass(k?: number | null) {
  if (k == null) return 'bg-white'
  if (k >= 2500) return 'bg-orange-800'
  if (k >= 2000) return 'bg-orange-600'
  if (k >= 1600) return 'bg-orange-500'
  if (k >= 1200) return 'bg-orange-400'
  if (k >= 1000) return 'bg-orange-300'
  return 'bg-white'
}
function goutBgClass(g?: number | null) {
  if (g == null) return 'bg-white'
  const v = Math.max(0, Math.min(8, Math.floor(g)))
  if (v === 0) return 'bg-white'
  const shades = [
    'bg-green-100',
    'bg-green-200',
    'bg-green-300',
    'bg-green-400',
    'bg-green-500',
    'bg-green-600',
    'bg-green-700',
    'bg-green-800',
  ]
  return shades[v - 1]
}

// ===== Page =====
export default function HealthLogPage() {
  // Date của entry mới (mặc định hôm nay) — hiển thị cạnh nút Add entry
  const [formDate, setFormDate] = useState<string>(todayVN())

  // Data & UI state
  const [items, setItems] = useState<HealthLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // View mode + pagination
  const [filterMode, setFilterMode] = useState<FilterMode>('last7')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Add form state
  const [form, setForm] = useState({
    weight: '',
    morning: '',
    gym: '',
    afternoon: '',
    noEatAfter: '',
    calories: '',
    goutTreatment: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Edit modal state
  const [editing, setEditing] = useState<HealthLog | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    weight: '',
    morning: '',
    gym: '',
    afternoon: '',
    noEatAfter: '',
    calories: '',
    goutTreatment: '',
    status: 'active' as Status,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Menu state (per-row action menu)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  // Close menus by outside click / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest?.('[data-row-menu]')) setMenuOpenId(null)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpenId(null)
        setEditing(null)
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // Build query string for GET list
  function buildQuery() {
    const today = todayVN()
    const qs = new URLSearchParams()
    qs.set('status', 'active')
    qs.set('skip', String((page - 1) * pageSize))
    qs.set('take', String(pageSize))

    if (filterMode === 'last7') {
      const from = addDays(today, -6)
      const to = today
      qs.set('from', from)
      qs.set('to', to)
    } else if (filterMode === 'thisMonth') {
      const { start, end } = monthStartEndOf(today)
      qs.set('from', start)
      qs.set('to', end)
    } else {
      // all
    }
    return `/api/healthlog?${qs.toString()}`
  }

  // Load data
  const load = async () => {
    setIsLoading(true)
    try {
      const url = buildQuery()
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Fetch failed (${res.status})`)
      }
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
  }, [filterMode, page, pageSize])

  // Actions
  const createItem = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const payload = {
        date: formDate,
        weight: form.weight ? Number(form.weight).toFixed(2) : null,
        morning: form.morning || null,
        gym: form.gym || null,
        afternoon: form.afternoon || null,
        noEatAfter: form.noEatAfter || null,
        calories: form.calories ? Number(form.calories) : null,
        goutTreatment: form.goutTreatment ? Number(form.goutTreatment) : null,
      }
      const res = await fetch('/api/healthlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot create')
      }
      await load()
      setForm({
        weight: '',
        morning: '',
        gym: '',
        afternoon: '',
        noEatAfter: '',
        calories: '',
        goutTreatment: '',
      })
    } catch (e) {
      alert((e as Error).message || 'Cannot create')
    } finally {
      setIsCreating(false)
    }
  }

  const openEdit = (item: HealthLog) => {
    setEditing(item)
    setEditForm({
      date: item.date || todayVN(),
      weight: item.weight ?? '',
      morning: item.morning ?? '',
      gym: item.gym ?? '',
      afternoon: item.afternoon ?? '',
      noEatAfter: item.noEatAfter ?? '',
      calories: item.calories != null ? String(item.calories) : '',
      goutTreatment: item.goutTreatment != null ? String(item.goutTreatment) : '',
      status: item.status,
    })
  }

  const updateItem = async () => {
    if (!editing || isUpdating) return
    setIsUpdating(true)
    try {
      const payload: any = {
        date: editForm.date,
        weight: editForm.weight ? Number(editForm.weight).toFixed(2) : null,
        morning: editForm.morning || null,
        gym: editForm.gym || null,
        afternoon: editForm.afternoon || null,
        noEatAfter: editForm.noEatAfter || null,
        calories: editForm.calories ? Number(editForm.calories) : null,
        goutTreatment: editForm.goutTreatment ? Number(editForm.goutTreatment) : null,
        status: editForm.status,
      }
      const res = await fetch(`/api/healthlog/${editing.id}`, {
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
      setIsUpdating(false)
    }
  }

  const deleteItem = async (id: string) => {
    setMenuOpenId(null)
    if (!confirm('Delete this entry? (soft delete)')) return
    try {
      const res = await fetch(`/api/healthlog/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Cannot delete')
      }
      await load()
    } catch (e) {
      alert((e as Error).message || 'Cannot delete')
    }
  }

  // Defaults + Clear
  const genDefaults = () => {
    setForm({
      weight: '57', // default 57
      morning: 'Tập bóng', // default Tập bóng (Capped)
      gym: '', // default blank
      afternoon: '', // default blank
      noEatAfter: '', // default blank
      calories: '1500', // default 1500
      goutTreatment: '2', // default 2
    })
  }
  const clearForm = () => {
    setForm({
      weight: '',
      morning: '',
      gym: '',
      afternoon: '',
      noEatAfter: '',
      calories: '',
      goutTreatment: '',
    })
  }

  // ===== UI =====
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Health Log</h1>

        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600">View:</label>
          <select
            value={filterMode}
            onChange={(e) => {
              setPage(1)
              setFilterMode(e.target.value as FilterMode)
            }}
            className="px-2 py-1 rounded-md border text-sm"
          >
            <option value="last7">Last 7 days</option>
            <option value="thisMonth">This month</option>
            <option value="all">All</option>
          </select>

          <label className="ml-3 text-sm text-gray-600">Page size:</label>
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
      </div>

      {/* Add form */}
      <div className="rounded-md border bg-white p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {/* Weight (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
            <input
              list="dlWeight"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="57"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="decimal"
            />
          </div>

          {/* Morning (col-2) */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Morning</label>
            <input
              list="dlMorning"
              value={form.morning}
              onChange={(e) => setForm((f) => ({ ...f, morning: e.target.value }))}
              placeholder="Tập bóng"
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          {/* Gym (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Gym</label>
            <input
              list="dlGym"
              value={form.gym}
              onChange={(e) => setForm((f) => ({ ...f, gym: e.target.value }))}
              placeholder=""
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          {/* Afternoon (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Afternoon</label>
            <input
              list="dlAfternoon"
              value={form.afternoon}
              onChange={(e) => setForm((f) => ({ ...f, afternoon: e.target.value }))}
              placeholder=""
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          {/* No eat after (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">No eat after 18:30</label>
            <input
              list="dlNoEat"
              value={form.noEatAfter}
              onChange={(e) => setForm((f) => ({ ...f, noEatAfter: e.target.value }))}
              placeholder=""
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>

          {/* Calories (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Calories</label>
            <input
              list="dlCalories"
              value={form.calories}
              onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
              placeholder="0"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="numeric"
            />
          </div>

          {/* Gout (col-1) */}
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Gout</label>
            <input
              list="dlGout"
              value={form.goutTreatment}
              onChange={(e) => setForm((f) => ({ ...f, goutTreatment: e.target.value }))}
              placeholder="0"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* DataLists (Capitalized) */}
        <datalist id="dlWeight">
          <option value="55" />
          <option value="56" />
          <option value="57" />
          <option value="58" />
          <option value="59" />
          <option value="60" />
        </datalist>
        <datalist id="dlMorning">
          <option value="Tập bóng" />
          <option value="Chạy bộ" />
          <option value="Đạp xe" />
          <option value="Cầu lông" />
        </datalist>
        <datalist id="dlGym">
          <option value="Tay" />
          <option value="Vai" />
          <option value="Ngực" />
          <option value="Chân" />
        </datalist>
        <datalist id="dlAfternoon">
          <option value="Đá bóng" />
          <option value="Chạy bộ" />
          <option value="Tập bóng" />
        </datalist>
        <datalist id="dlNoEat">
          <option value="Ok" />
          <option value="16/8" />
          <option value="24/0" />
        </datalist>
        <datalist id="dlCalories">
          <option value="1500" />
          <option value="2000" />
          <option value="2500" />
        </datalist>
        <datalist id="dlGout">
          <option value="0" />
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="4" />
          <option value="5" />
          <option value="6" />
          <option value="7" />
          <option value="8" />
        </datalist>

        {/* Actions under inputs */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={genDefaults}
              className="px-3 py-1.5 rounded-md border bg-gray-100 hover:bg-gray-200"
              type="button"
              title="Generate default values"
            >
              Gen default
            </button>
            <button
              onClick={clearForm}
              className="px-3 py-1.5 rounded-md border hover:bg-gray-50"
              type="button"
              title="Clear form"
            >
              Clear form
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="px-3 py-1.5 rounded-md border text-sm"
              title="Entry date"
              aria-label="Entry date"
            />
            <button
              onClick={createItem}
              disabled={isCreating}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-600 bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60"
            >
              {isCreating ? <Spinner className="w-4 h-4 text-white" /> : <PlusIcon />}
              <span>{isCreating ? 'Saving...' : 'Add entry'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-left">Date</th>
              <th className="px-3 sm:px-4 py-2 text-left">Wday</th>
              <th className="px-3 sm:px-4 py-2 text-right">Weight</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Morning</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Gym</th>
              <th className="px-3 sm:px-4 py-2 text-left">Afternoon</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">NoEat18:30</th>
              <th className="px-3 sm:px-4 py-2 text-right">Kcal</th>
              <th className="px-3 sm:px-4 py-2 text-right">Gout</th>
              <th className="px-3 sm:px-4 py-2 text-right w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={10} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" /> Loading...
                  </span>
                </td>
              </tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  No records.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((it) => {
                const isMenuOpen = menuOpenId === it.id
                const wd = weekdayOf(it.date) // 'Sun', 'Mon', ...
                const isSun = wd === 'Sun'

                const hasMorning = !!(it.morning && it.morning.trim())
                const hasGym = !!(it.gym && it.gym.trim())
                const hasAfternoon = !!(it.afternoon && it.afternoon.trim())
                const hasNoEat = !!(it.noEatAfter && it.noEatAfter.trim())

                return (
                  <tr
                    key={it.id}
                    className={[
                      'border-t',
                      it.status === 'disabled'
                        ? 'bg-gray-100 text-gray-500'
                        : 'odd:bg-white even:bg-gray-50',
                    ].join(' ')}
                  >
                    <td className="px-3 sm:px-4 py-2">{it.date}</td>
                    <td className={`px-3 sm:px-4 py-2 ${isSun ? 'bg-orange-300' : ''}`}>{wd}</td>
                    <td className="px-3 sm:px-4 py-2 text-right">
                      {it.weight ? Number(it.weight).toFixed(2) : '-'}
                    </td>

                    {/* Morning */}
                    <td
                      className={[
                        'px-3 sm:px-4 py-2 hidden md:table-cell',
                        hasMorning ? 'bg-green-300' : '',
                      ].join(' ')}
                    >
                      <span title={it.morning || ''}>{shorten(it.morning, 20)}</span>
                    </td>

                    {/* Gym */}
                    <td
                      className={[
                        'px-3 sm:px-4 py-2 hidden md:table-cell',
                        hasGym ? 'bg-green-300' : '',
                      ].join(' ')}
                    >
                      <span title={it.gym || ''}>{shorten(it.gym, 16)}</span>
                    </td>

                    {/* Afternoon */}
                    <td
                      className={['px-3 sm:px-4 py-2', hasAfternoon ? 'bg-green-300' : ''].join(
                        ' '
                      )}
                    >
                      <span title={it.afternoon || ''}>{shorten(it.afternoon, 18)}</span>
                    </td>

                    {/* NoEat18:30 */}
                    <td
                      className={[
                        'px-3 sm:px-4 py-2 hidden md:table-cell',
                        hasNoEat ? 'bg-green-300' : '',
                      ].join(' ')}
                    >
                      <span title={it.noEatAfter || ''}>{shorten(it.noEatAfter, 10)}</span>
                    </td>

                    <td className={`px-3 sm:px-4 py-2 text-right ${kcalBgClass(it.calories)}`}>
                      {it.calories ?? '-'}
                    </td>
                    <td className={`px-3 sm:px-4 py-2 text-right ${goutBgClass(it.goutTreatment)}`}>
                      {it.goutTreatment ?? '-'}
                    </td>

                    <td className="px-3 sm:px-4 py-2 text-right relative select-none" data-row-menu>
                      <button
                        type="button"
                        onClick={() => setMenuOpenId((v) => (v === it.id ? null : it.id))}
                        className="inline-grid place-items-center w-7 h-7 rounded hover:bg-gray-100"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        aria-label="Open row menu"
                      >
                        <DotsIcon />
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-2 bottom-8 z-20 w-36 rounded-md border bg-white shadow-lg py-1 text-sm"
                        >
                          <button
                            role="menuitem"
                            onClick={() => {
                              setMenuOpenId(null)
                              openEdit(it)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                          >
                            <EditIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => deleteItem(it.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
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
              <h2 className="text-lg font-semibold">Edit entry</h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 inline-grid place-items-center rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal fields order aligned with table (Morning col-2, others col-1) */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
              {/* Date (col-2) */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              {/* Weight (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">Weight</label>
                <input
                  list="dlWeight"
                  value={editForm.weight}
                  onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="decimal"
                />
              </div>

              {/* Morning (col-2) */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Morning</label>
                <input
                  list="dlMorning"
                  value={editForm.morning}
                  onChange={(e) => setEditForm((f) => ({ ...f, morning: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              {/* Gym (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">Gym</label>
                <input
                  list="dlGym"
                  value={editForm.gym}
                  onChange={(e) => setEditForm((f) => ({ ...f, gym: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              {/* Afternoon (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">Afternoon</label>
                <input
                  list="dlAfternoon"
                  value={editForm.afternoon}
                  onChange={(e) => setEditForm((f) => ({ ...f, afternoon: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              {/* No eat after 18:30 (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">No eat 18:30</label>
                <input
                  list="dlNoEat"
                  value={editForm.noEatAfter}
                  onChange={(e) => setEditForm((f) => ({ ...f, noEatAfter: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              {/* Calories (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">Calories</label>
                <input
                  list="dlCalories"
                  value={editForm.calories}
                  onChange={(e) => setEditForm((f) => ({ ...f, calories: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="numeric"
                />
              </div>

              {/* Gout (col-1) */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">Gout</label>
                <input
                  list="dlGout"
                  value={editForm.goutTreatment}
                  onChange={(e) => setEditForm((f) => ({ ...f, goutTreatment: e.target.value }))}
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="numeric"
                />
              </div>

              {/* Status (col-1) */}
              <div className="col-span-1">
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
                onClick={updateItem}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60"
              >
                {isUpdating ? <Spinner className="w-4 h-4 text-white" /> : <SaveIcon />}
                <span>{isUpdating ? 'Saving...' : 'Save changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
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
