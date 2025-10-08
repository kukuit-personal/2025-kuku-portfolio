'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

// --- Demo data (replace with API) ---
const CAMPAIGNS = [
  { id: 'cp-001', name: 'August Promo' },
  { id: 'cp-002', name: 'Weekly Newsletter #32' },
  { id: 'cp-003', name: 'New Feature Launch' },
]

const EVENTS = [
  {
    id: 'e1',
    time: '2025-08-18 09:12',
    recipient: 'alice@example.com',
    type: 'delivered',
    meta: 'SES-id-xxx',
  },
  {
    id: 'e2',
    time: '2025-08-18 09:13',
    recipient: 'bob@example.com',
    type: 'opened',
    meta: 'UA Chrome',
  },
  {
    id: 'e3',
    time: '2025-08-18 09:15',
    recipient: 'cathy@example.com',
    type: 'clicked',
    meta: '/promo',
  },
  {
    id: 'e4',
    time: '2025-08-18 09:20',
    recipient: 'david@example.com',
    type: 'bounced',
    meta: 'Mailbox full',
  },
  {
    id: 'e5',
    time: '2025-08-18 09:25',
    recipient: 'eva@example.com',
    type: 'complained',
    meta: 'Feedback loop',
  },
  {
    id: 'e6',
    time: '2025-08-18 09:30',
    recipient: 'frank@example.com',
    type: 'opened',
    meta: 'iOS Mail',
  },
  {
    id: 'e7',
    time: '2025-08-18 09:35',
    recipient: 'alice@example.com',
    type: 'clicked',
    meta: '/checkout',
  },
]

type EventType =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed'

export default function TrackingPage() {
  const [campaign, setCampaign] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<EventType | ''>('')
  const [search, setSearch] = useState('')

  const filteredEvents = useMemo(() => {
    return EVENTS.filter((e) => {
      const matchCampaign = true // replace by campaign check when events carry campaignId
      const matchType = !typeFilter || e.type === typeFilter
      const matchText = [e.recipient, e.meta, e.type].some((v) =>
        v.toLowerCase().includes(search.toLowerCase())
      )
      const matchFrom = !dateFrom || e.time >= `${dateFrom} 00:00`
      const matchTo = !dateTo || e.time <= `${dateTo} 23:59`
      return matchCampaign && matchType && matchText && matchFrom && matchTo
    })
  }, [campaign, typeFilter, search, dateFrom, dateTo])

  const totals = useMemo(() => {
    const t: Record<EventType, number> = {
      queued: 0,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
    }
    EVENTS.forEach((e) => (t[e.type as EventType] = (t[e.type as EventType] || 0) + 1))
    const delivered = t.delivered
    const opened = t.opened
    const clicked = t.clicked
    const bounced = t.bounced
    const complained = t.complained
    const openRate = delivered ? Math.round((opened / delivered) * 100) : 0
    const clickRate = delivered ? Math.round((clicked / delivered) * 100) : 0
    const bounceRate = delivered ? Math.round((bounced / delivered) * 100) : 0
    const complaintRate = delivered ? Math.round((complained / delivered) * 100) : 0
    return { ...t, openRate, clickRate, bounceRate, complaintRate }
  }, [])

  return (
    <div className="">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Open/Click Tracking</h1>
        <div className="text-sm text-slate-500">
          Data shown is demo. Connect your ESP to see real-time events.
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <select
          className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
        >
          <option value="">All campaigns</option>
          {CAMPAIGNS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-xl border border-slate-300 p-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EventType | '')}
        >
          <option value="">All event types</option>
          {['delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-xl border border-slate-300 p-2 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="rounded-xl border border-slate-300 p-2 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <input
          placeholder="Search email, meta..."
          className="rounded-xl border border-slate-300 p-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* KPI Cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Delivered" value={totals.delivered} />
        <KPI label="Open rate" value={`${totals.openRate}%`} />
        <KPI label="Click rate" value={`${totals.clickRate}%`} />
        <KPI label="Bounce rate" value={`${totals.bounceRate}%`} />
      </div>

      {/* Progress bars */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Bar label="Opened" value={totals.opened} max={Math.max(1, totals.delivered)} />
        <Bar label="Clicked" value={totals.clicked} max={Math.max(1, totals.delivered)} />
        <Bar label="Bounced" value={totals.bounced} max={Math.max(1, totals.delivered)} />
        <Bar label="Complaints" value={totals.complained} max={Math.max(1, totals.delivered)} />
      </div>

      {/* Events table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Meta</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e) => (
              <tr key={e.id} className="border-t text-sm">
                <td className="px-4 py-3 text-slate-700">{e.time}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{e.recipient}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs border ${badgeColor(e.type as EventType)}`}
                  >
                    {e.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{e.meta}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
                    View
                  </button>
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
                    Re-Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Help & Setup */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-800 mb-1">Link tracking</div>
          <p className="text-sm text-slate-600">
            Auto-append UTM parameters and track per-link clicks.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-800 mb-1">Domain auth</div>
          <p className="text-sm text-slate-600">
            Set up SPF, DKIM & DMARC to improve deliverability.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-800 mb-1">Webhooks</div>
          <p className="text-sm text-slate-600">
            Connect Mailgun / SendGrid / SES events to see live data.
          </p>
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-800">{value}</div>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100))
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
        <div className="h-2 bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function badgeColor(t: EventType) {
  switch (t) {
    case 'delivered':
      return 'border-green-600 text-green-700'
    case 'opened':
      return 'border-indigo-600 text-indigo-700'
    case 'clicked':
      return 'border-blue-600 text-blue-700'
    case 'bounced':
      return 'border-amber-600 text-amber-700'
    case 'complained':
      return 'border-rose-600 text-rose-700'
    case 'unsubscribed':
      return 'border-slate-600 text-slate-700'
    default:
      return 'border-slate-400 text-slate-600'
  }
}
