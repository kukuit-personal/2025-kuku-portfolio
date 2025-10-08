'use client'

import { useMemo, useState } from 'react'

type Role = 'Admin' | 'Client'
type UserRow = {
  id: number
  name: string
  email: string
  role: Role
  rating: number // 1..5
  deposit: number // USD
  on: number // template on
  total: number // template total
  active: boolean
}

export default function AdminUsers() {
  // 10 users demo, role: Admin/Client
  const USERS: UserRow[] = useMemo(
    () =>
      Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@company.com`,
        role: (i % 2 === 0 ? 'Admin' : 'Client') as Role,
        rating: (i % 5) + 1,
        deposit: 2350 + i * 127.75,
        on: 34 + i,
        total: 56,
        active: i % 2 === 0,
      })),
    []
  )

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(USERS.length / pageSize)

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return USERS.slice(start, start + pageSize)
  }, [USERS, page])

  const formatUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, USERS.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <button className="px-3 py-1.5 rounded-xl bg-black text-white text-sm">+ New User</button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">Danh sách người dùng (UI demo)</div>
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{startIndex}</span>–
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{USERS.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Rate</th>
                <th className="text-left p-3">Deposit</th>
                <th className="text-left p-3">Template On</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>

                  {/* Role: Admin | Client */}
                  <td className="p-3">
                    <span
                      className={
                        'px-2 py-0.5 rounded-full text-xs font-medium border ' +
                        (u.role === 'Admin'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200')
                      }
                    >
                      {u.role}
                    </span>
                  </td>

                  {/* Rate */}
                  <td className="p-3">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-yellow-500">{'★'.repeat(u.rating)}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - u.rating)}</span>
                      <span className="text-xs text-gray-500 ml-1">{u.rating}/5</span>
                    </div>
                  </td>

                  {/* Deposit */}
                  <td className="p-3 font-medium">{formatUSD(u.deposit)}</td>

                  {/* Template On */}
                  <td className="p-3">
                    <span className="font-medium">{u.on}</span>
                    <span className="text-gray-500">/{u.total}</span>
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={
                        'px-2 py-0.5 rounded-full text-xs font-medium ' +
                        (u.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200')
                      }
                    >
                      {u.active ? 'active' : 'disable'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <button className="px-2 py-1 rounded-lg hover:bg-gray-100">Edit</button>
                  </td>
                </tr>
              ))}

              {pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Page <span className="font-medium">{page}</span> / {totalPages}
          </div>

          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              const isCurrent = p === page
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={
                    'px-3 py-1.5 rounded-lg text-sm border ' +
                    (isCurrent ? 'bg-black text-white border-black' : 'hover:bg-gray-50')
                  }
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
