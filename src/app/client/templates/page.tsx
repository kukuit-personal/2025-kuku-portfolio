'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const images = [
  '/images/templates/template1.png',
  '/images/templates/template2.png',
  '/images/templates/template3.png',
]

type FilterMode = 'store' | 'me' | 'purchased'

type TemplateItem = {
  id: number
  image: string
  updatedDaysAgo: number
  creator: string
  price: number
  isMine: boolean
  isPurchased: boolean
  isPublished?: boolean
}

export default function TemplatesPage() {
  const [showPreview, setShowPreview] = useState(false)
  const [showBuy, setShowBuy] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [mode, setMode] = useState<FilterMode>('store')
  const [balance, setBalance] = useState<number>(25)
  const [selected, setSelected] = useState<TemplateItem | null>(null)

  // ===== Data init =====
  const creators = useMemo(
    () => ['Admin', ...Array.from({ length: 25 }, (_, i) => `User ${i + 1}`)],
    []
  )

  const initialItems = useMemo<TemplateItem[]>(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const isMine = i % 5 === 0
        const isPurchased = !isMine && i % 4 === 1
        return {
          id: i + 1,
          image: images[i % images.length],
          updatedDaysAgo: (i % 9) + 1,
          creator: creators[(i * 7) % creators.length],
          price: 5.0,
          isMine,
          isPurchased,
          isPublished: false,
        }
      }),
    [creators]
  )

  const [items, setItems] = useState<TemplateItem[]>(initialItems)

  // ===== Filter =====
  const filtered = useMemo(() => {
    switch (mode) {
      case 'me':
        return items.filter((it) => it.isMine)
      case 'purchased':
        return items.filter((it) => it.isPurchased)
      default:
        return items.filter((it) => !it.isMine && !it.isPurchased)
    }
  }, [items, mode])

  // ===== Pagination =====
  const pageSize = 6
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [mode])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  const startIndex = filtered.length ? (page - 1) * pageSize + 1 : 0
  const endIndex = filtered.length ? Math.min(page * pageSize, filtered.length) : 0

  // Counters
  const mineCount = items.filter((i) => i.isMine).length
  const purchasedCount = items.filter((i) => i.isPurchased).length
  const storeCount = items.filter((i) => !i.isMine && !i.isPurchased).length

  const btn = 'px-3 py-1.5 rounded-xl bg-black text-white text-sm hover:bg-gray-900'
  const formatUSD = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  // ===== Handlers =====
  const openBuy = (item: TemplateItem) => {
    setSelected(item)
    setShowBuy(true)
  }

  const openPublish = (item: TemplateItem) => {
    setSelected(item)
    setShowPublish(true)
  }

  const payNow = () => {
    if (!selected) return
    if (balance < selected.price) return
    setBalance((b) => +(b - selected.price).toFixed(2))
    setItems((prev) =>
      prev.map((it) => (it.id === selected.id ? { ...it, isPurchased: true } : it))
    )
    setShowBuy(false)
    alert(`Purchased template #${selected.id} for ${formatUSD(selected.price)}`)
  }

  const doPublish = () => {
    if (!selected) return
    setItems((prev) =>
      prev.map((it) => (it.id === selected.id ? { ...it, isPublished: true } : it))
    )
    setShowPublish(false)
    alert(`Template #${selected.id} is now published to store (demo)`)
  }

  return (
    <div className="space-y-6">
      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">Templates</h1>
          <Link
            href="./templates/new"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black text-white text-sm hover:bg-gray-900"
          >
            + Add
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{startIndex}</span>–
          <span className="font-medium">{endIndex}</span> of{' '}
          <span className="font-medium">{filtered.length}</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border p-1">
          <button
            onClick={() => setMode('store')}
            className={
              'px-3 py-1.5 rounded-lg text-sm ' +
              (mode === 'store' ? 'bg-black text-white' : 'hover:bg-gray-50')
            }
          >
            Template Stores
          </button>
          <button
            onClick={() => setMode('me')}
            className={
              'px-3 py-1.5 rounded-lg text-sm ' +
              (mode === 'me' ? 'bg-black text-white' : 'hover:bg-gray-50')
            }
          >
            Template by me
          </button>
          <button
            onClick={() => setMode('purchased')}
            className={
              'px-3 py-1.5 rounded-lg text-sm ' +
              (mode === 'purchased' ? 'bg-black text-white' : 'hover:bg-gray-50')
            }
          >
            Purchased
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Store: <span className="font-medium">{storeCount}</span> · Mine:{' '}
          <span className="font-medium">{mineCount}</span> · Purchased:{' '}
          <span className="font-medium">{purchasedCount}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pageData.map((item) => {
          const isAdmin = item.creator === 'Admin'
          const createdByBadge =
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ' +
            (item.isMine
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : isAdmin
                ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                : 'bg-amber-50 text-amber-700 ring-amber-200')

          return (
            <div key={item.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <Image src={item.image} alt={`Template ${item.id}`} fill className="object-cover" />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    Template #{item.id}
                    {item.isPublished && (
                      <span className="ml-2 align-middle text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                        published
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated {item.updatedDaysAgo} {item.updatedDaysAgo === 1 ? 'day' : 'days'} ago
                  </div>

                  {/* Created by (nếu của tôi → 'me') */}
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">Created by</span>{' '}
                    <span className={createdByBadge}>{item.isMine ? 'me' : item.creator}</span>
                  </div>
                </div>

                {/* Actions theo tab */}
                <div className="flex items-center space-x-2">
                  <div className="text-md text-gray-500">${item.price.toFixed(2)}</div>

                  {mode === 'store' && (
                    <>
                      <button title="Buy template" className={btn} onClick={() => openBuy(item)}>
                        Buy
                      </button>
                      <button
                        title="View"
                        onClick={() => {
                          setSelected(item)
                          setShowPreview(true)
                        }}
                        className={btn}
                      >
                        View
                      </button>
                    </>
                  )}

                  {mode === 'me' && (
                    <>
                      <button
                        title="View"
                        onClick={() => {
                          setSelected(item)
                          setShowPreview(true)
                        }}
                        className={btn}
                      >
                        View
                      </button>
                      {/* Edit giữ href ./templates/edit như yêu cầu */}
                      <Link href="./templates/edit" title="Edit template" className={btn}>
                        Edit
                      </Link>
                      <button
                        title="Publish to store"
                        className={btn}
                        onClick={() => openPublish(item)}
                      >
                        Publish
                      </button>
                      {/* ✅ Send -> Link tới /client/send-email kèm id */}
                      <Link
                        href={`/client/send-email?template=${item.id}`}
                        title="Send email"
                        className={btn}
                      >
                        Send
                      </Link>
                    </>
                  )}

                  {mode === 'purchased' && (
                    <>
                      <button
                        title="View"
                        onClick={() => {
                          setSelected(item)
                          setShowPreview(true)
                        }}
                        className={btn}
                      >
                        View
                      </button>
                      {/* ✅ Send -> Link tới /client/send-email kèm id */}
                      <Link
                        href={`/client/send-email?template=${item.id}`}
                        title="Send email"
                        className={btn}
                      >
                        Send
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {pageData.length === 0 && (
          <div className="col-span-full p-10 text-center text-gray-500">No templates found.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Page <span className="font-medium">{totalPages ? page : 0}</span> /{' '}
          {Math.max(totalPages, 1)}
        </div>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          {Array.from({ length: Math.max(totalPages, 1) }).map((_, i) => {
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
            disabled={page === totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </nav>
      </div>

      {/* Popup View */}
      {showPreview && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white rounded-2xl shadow-lg p-4">
            <div className="w-[80vw] h-[80vh] relative">
              <Image
                src="/images/templates/template3-full.png"
                alt={`Template #${selected.id} Full`}
                fill
                className="object-contain rounded-xl"
              />
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 bg-gray-200 rounded-full px-2 py-1 text-sm hover:bg-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Popup Buy */}
      {showBuy && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white rounded-2xl shadow-lg p-4 w-[92vw] max-w-xl">
            <button
              onClick={() => setShowBuy(false)}
              className="absolute top-2 right-2 bg-gray-200 rounded-full px-2 py-1 text-sm hover:bg-gray-300"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="relative w-40 aspect-video rounded-xl overflow-hidden ring-1 ring-gray-200">
                  <Image
                    src={selected.image}
                    alt={`Template #${selected.id}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-lg font-semibold">Buy Template #{selected.id}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Created by{' '}
                    <span className="font-medium">{selected.isMine ? 'me' : selected.creator}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="text-base font-semibold">{formatUSD(selected.price)}</div>
                    </div>
                    <div className="rounded-xl border p-3">
                      <div className="text-xs text-gray-500">Your Balance</div>
                      <div className="text-base font-semibold">{formatUSD(balance)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {balance >= selected.price
                    ? 'Sufficient balance'
                    : 'Insufficient balance – please Top up'}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={btn}
                    onClick={() => setBalance((b) => +(b + 10).toFixed(2))}
                    title="Add $10 to your balance (demo)"
                  >
                    Top up +$10
                  </button>
                  <button
                    className={btn}
                    onClick={payNow}
                    disabled={balance < selected.price}
                    title="Pay now"
                    style={{ opacity: balance < selected.price ? 0.6 : 1 }}
                  >
                    Pay {formatUSD(selected.price)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Publish */}
      {showPublish && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white rounded-2xl shadow-lg p-4 w-[92vw] max-w-xl">
            <button
              onClick={() => setShowPublish(false)}
              className="absolute top-2 right-2 bg-gray-200 rounded-full px-2 py-1 text-sm hover:bg-gray-300"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-start gap-4">
              <div className="relative w-40 aspect-video rounded-xl overflow-hidden ring-1 ring-gray-200">
                <Image
                  src={selected.image}
                  alt={`Template #${selected.id}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="text-lg font-semibold">Publish Template #{selected.id}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Created by{' '}
                  <span className="font-medium">{selected.isMine ? 'me' : selected.creator}</span>
                </div>

                <div className="mt-3 rounded-xl border p-3">
                  <div className="text-xs text-gray-500">Listing Price</div>
                  <div className="text-base font-semibold">{formatUSD(selected.price)}</div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    className={btn}
                    onClick={doPublish}
                    title="Publish this template to store"
                  >
                    Up to store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
