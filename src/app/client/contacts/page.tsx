'use client'

import { useMemo, useState } from 'react'

// --- Demo data (replace with your API data) ---
const GROUPS_DEMO = [
  { id: 'g1', name: 'All Subscribers' },
  { id: 'g2', name: 'VIP Customers' },
  { id: 'g3', name: 'Leads - Last 30 days' },
]

const CONTACTS_DEMO = Array.from({ length: 24 }).map((_, i) => ({
  id: 'c' + (i + 1),
  name: `Contact ${i + 1}`,
  email: `contact${i + 1}@example.com`,
  groups: i % 3 === 0 ? ['g1'] : i % 3 === 1 ? ['g2'] : ['g3'],
}))

const PAGE_SIZE = 10

export default function ContactsPage() {
  const [groups, setGroups] = useState(GROUPS_DEMO)
  const [contacts, setContacts] = useState(CONTACTS_DEMO)

  // UI state
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [filter, setFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [page, setPage] = useState(1)

  // Form states
  const [newContact, setNewContact] = useState({ name: '', email: '', groups: [] as string[] })
  const [newGroupName, setNewGroupName] = useState('')

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchText = [c.name, c.email].some((v) =>
        v.toLowerCase().includes(filter.toLowerCase())
      )
      const matchGroup = !groupFilter || c.groups.includes(groupFilter)
      return matchText && matchGroup
    })
  }, [contacts, filter, groupFilter])

  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE)
  const pageContacts = filteredContacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function addGroup() {
    const name = newGroupName.trim()
    if (!name) return
    const id = 'g' + (groups.length + 1)
    setGroups((prev) => [...prev, { id, name }])
    setNewGroupName('')
    setShowAddGroup(false)
  }

  function toggleGroupInNewContact(gid: string) {
    setNewContact((prev) => {
      const exists = prev.groups.includes(gid)
      return {
        ...prev,
        groups: exists ? prev.groups.filter((g) => g !== gid) : [...prev.groups, gid],
      }
    })
  }

  function addContact() {
    const name = newContact.name.trim()
    const email = newContact.email.trim()
    if (!name || !email) return
    const id = 'c' + (contacts.length + 1)
    setContacts((prev) => [...prev, { id, name, email, groups: newContact.groups }])
    setNewContact({ name: '', email: '', groups: [] })
    setShowAddContact(false)
  }

  function groupName(gid: string) {
    return groups.find((g) => g.id === gid)?.name || gid
  }

  return (
    <div className="">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddGroup(true)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            + Add Group
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            + Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          placeholder="Search name or email..."
          className="w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value)
            setPage(1)
          }}
          className="w-full rounded-xl border border-slate-300 p-2 text-sm"
        >
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <div className="text-sm text-slate-500 self-center">
          {filteredContacts.length} contact(s)
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Group list</th>
              <th className="px-4 py-3">Stats</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageContacts.map((c) => {
              // dữ liệu stats giả (có thể lấy từ API sau)
              const stats = {
                sent: Math.floor(Math.random() * 50) + 1,
                open: Math.floor(Math.random() * 30),
                click: Math.floor(Math.random() * 10),
                blocked: Math.random() > 0.85, // 15% bị block
              }

              return (
                <tr key={c.id} className="border-t text-sm">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-700">{c.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {c.groups.length === 0 && <span className="text-xs text-slate-400">—</span>}
                      {c.groups.map((gid) => (
                        <span
                          key={gid}
                          className="rounded-full border border-slate-300 px-2 py-1 text-xs"
                        >
                          {groupName(gid)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        Sent: <span className="font-medium">{stats.sent}</span>
                      </span>
                      <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5">
                        Open: <span className="font-medium">{stats.open}</span>
                      </span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                        Click: <span className="font-medium">{stats.click}</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          stats.blocked
                            ? 'bg-red-50 text-red-600 font-medium'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {stats.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <div>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredContacts.length)} of {filteredContacts.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded-lg border border-slate-300 px-3 py-1 ${page === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddContact(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Add Contact</h3>
              <button
                className="text-slate-500 hover:underline"
                onClick={() => setShowAddContact(false)}
              >
                ✕
              </button>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Name</label>
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Email</label>
                <input
                  value={newContact.email}
                  onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <div className="mb-1 text-sm text-slate-600">Groups</div>
                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => {
                    const checked = newContact.groups.includes(g.id)
                    return (
                      <label
                        key={g.id}
                        className={`cursor-pointer rounded-full border px-2 py-1 text-xs ${checked ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600'}`}
                      >
                        <input
                          type="checkbox"
                          className="mr-1 align-middle"
                          checked={checked}
                          onChange={() => toggleGroupInNewContact(g.id)}
                        />
                        {g.name}
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                onClick={() => setShowAddContact(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={addContact}
              >
                Add contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddGroup(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Add Group</h3>
              <button
                className="text-slate-500 hover:underline"
                onClick={() => setShowAddGroup(false)}
              >
                ✕
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Group name</label>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                placeholder="VIP Customers"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                onClick={() => setShowAddGroup(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={addGroup}
              >
                Add group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
