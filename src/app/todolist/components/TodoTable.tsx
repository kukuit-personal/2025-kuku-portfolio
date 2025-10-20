'use client'

import { Fragment } from 'react'
import { Todo } from '../types'
import { fmtDateInput } from '../utils/date'
import { ChevronDownIcon, ChevronRightIcon, DotsIcon, EditIcon, PlusIcon, TrashIcon } from './icons'
import { Spinner } from './Spinner'
import { SubForm } from './SubForm'

export function TodoTable({
  items,
  isLoading,
  expanded,
  setExpanded,
  subtasks,
  subFormOpen,
  setSubFormOpen,
  menuOpenId,
  setMenuOpenId,
  onLoadSubtasks,
  onOpenEdit,
  onDelete,
  onCreateSub,
}: {
  items: Todo[]
  isLoading: boolean
  expanded: Record<string, boolean>
  setExpanded: (updater: any) => void
  subtasks: Record<string, Todo[]>
  subFormOpen: Record<string, boolean>
  setSubFormOpen: (updater: any) => void
  menuOpenId: string | null
  setMenuOpenId: (id: string | null) => void
  onLoadSubtasks: (parentId: string) => Promise<void>
  onOpenEdit: (it: Todo) => void
  onDelete: (id: string) => Promise<void>
  onCreateSub: (parentId: string, payload: { title: string; dueAt: string; priority: any }) => Promise<void>
}) {
  return (
    <div className="rounded-md border bg-white">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-4 py-2 text-left w-8"></th>
            <th className="px-3 sm:px-4 py-2 text-left">Title</th>
            <th className="px-3 sm:px-4 py-2 text-left hidden lg:table-cell">Category</th>
            <th className="px-3 sm:px-4 py-2 text-left hidden lg:table-cell">Priority</th>
            <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">State</th>
            <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Due</th>
            <th className="px-3 sm:px-4 py-2 text-right w-12">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                <span className="inline-flex items-center gap-2"><Spinner className="w-4 h-4" /> Loading...</span>
              </td>
            </tr>
          )}

          {!isLoading && items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 sm:px-4 py-6 text-center text-gray-500">No records.</td>
            </tr>
          )}

          {!isLoading && items.map((it, idx) => {
            const stripe = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            const rowTone = it.status === 'disabled' ? 'bg-gray-100 text-gray-500' : stripe
            const isOpen = !!expanded[it.id]
            const subs = subtasks[it.id] ?? []

            return (
              <Fragment key={it.id}>
                <tr className={[ 'border-t', rowTone ].join(' ')}>
                  <td className="px-2 py-1">
                    <button type="button" className="w-7 h-7 inline-grid place-items-center rounded hover:bg-gray-100" title={isOpen ? 'Collapse' : 'Expand'}
                      onClick={async () => { setExpanded((m: any) => ({ ...m, [it.id]: !m[it.id] })); if (!isOpen && !subtasks[it.id]) await onLoadSubtasks(it.id) }}>
                      {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </button>
                  </td>
                  <td className="px-3 sm:px-4 py-1">
                    <div className="font-medium">{it.title}</div>
                    {it.description ? (<div className="text-xs text-gray-500">{it.description}</div>) : null}
                  </td>
                  <td className="px-3 sm:px-4 py-1 hidden lg:table-cell">{it.category}</td>
                  <td className="px-3 sm:px-4 py-1 hidden lg:table-cell">{it.priority}</td>
                  <td className="px-3 sm:px-4 py-1 hidden md:table-cell">{it.state}</td>
                  <td className="px-3 sm:px-4 py-1 hidden md:table-cell">{fmtDateInput(it.dueAt) || ''}</td>
                  <td className="px-3 sm:px-4 py-1 text-right relative select-none" data-row-menu>
                    <button type="button" onClick={() => setMenuOpenId(menuOpenId === it.id ? null : it.id)} className="inline-grid place-items-center w-7 h-7 rounded hover:bg-gray-100" aria-haspopup="menu" aria-expanded={menuOpenId === it.id} aria-label="Open row menu">
                      <DotsIcon />
                    </button>

                    {menuOpenId === it.id && (
                      <div role="menu" className="absolute right-2 bottom-8 z-20 w-40 rounded-md border bg-white shadow-lg py-1 text-sm">
                        <button role="menuitem" onClick={() => { setMenuOpenId(null); onOpenEdit(it) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                          <EditIcon className="w-4 h-4" /> Edit
                        </button>
                        <button role="menuitem" onClick={() => onDelete(it.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600">
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                        <button role="menuitem" onClick={async () => { setMenuOpenId(null); setSubFormOpen((m: any) => ({ ...m, [it.id]: !m[it.id] })); if (!subtasks[it.id]) await onLoadSubtasks(it.id); setExpanded((m: any) => ({ ...m, [it.id]: true })) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                          <PlusIcon className="w-4 h-4" /> Add sub-todo
                        </button>
                      </div>
                    )}
                  </td>
                </tr>

                {isOpen && (
                  <tr className={rowTone}>
                    <td></td>
                    <td className="px-3 sm:px-4 py-2" colSpan={5}>
                      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                        {subFormOpen[it.id] && (
                          <SubForm onCreate={async (payload) => await onCreateSub(it.id, payload)} onCancel={() => setSubFormOpen((m: any) => ({ ...m, [it.id]: false }))} />
                        )}

                        {subs.length === 0 ? (
                          <div className="text-xs text-gray-500">No subtasks.</div>
                        ) : (
                          <table className="w-full text-xs">
                            <thead className="hidden md:table-header-group">
                              <tr className="text-gray-500">
                                <th className="py-1 text-left">Title</th>
                                <th className="py-1 text-left">Priority</th>
                                <th className="py-1 text-left">State</th>
                                <th className="py-1 text-left">Due</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subs.map((s, j) => (
                                <tr key={s.id} className={j % 2 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="py-1 pr-2">
                                    <div className="font-medium">{s.title}</div>
                                    {s.description ? (<div className="text-[11px] text-gray-500">{s.description}</div>) : null}
                                  </td>
                                  <td className="py-1 pr-2">{s.priority}</td>
                                  <td className="py-1 pr-2">{s.state}</td>
                                  <td className="py-1">{fmtDateInput(s.dueAt) || ''}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
