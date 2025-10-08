'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

type Granularity = 'day' | 'month' | 'year'

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  // Demo totals (có thể nối API thật sau)
  const totalTemplates = 24 // khớp trang Templates demo
  const totalUsers = 10 // khớp trang Users demo

  // ===== Mock dữ liệu email gửi đi =====
  // Tạo dữ liệu ổn định (không "nhảy" mỗi lần render)
  const { daily, monthly, yearly } = useMemo(() => {
    // helper deterministic "pseudo-random"
    const rnd =
      (seed: number) =>
      (mul: number, add = 0) =>
        ((seed * mul) % 37) + add

    // Daily: 30 ngày gần nhất
    const d: Array<{ name: string; value: number; date: Date }> = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const val = 80 + rnd(11 + i)(13, 0) * 3 // 80..~200
      d.push({
        name: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        value: val,
        date,
      })
    }

    // Monthly: 12 tháng gần nhất
    const m: Array<{ name: string; value: number; ym: string }> = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = 1800 + rnd(7 + i)(17) * 40 // ~1800..~2600
      m.push({
        name: date.toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' }),
        value: val,
        ym: `${date.getFullYear()}-${date.getMonth() + 1}`,
      })
    }

    // Yearly: 5 năm gần nhất
    const y: Array<{ name: string; value: number; year: number }> = []
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i
      const val = 20000 + rnd(5 + i)(23) * 500 // ~20k..~31k
      y.push({ name: String(year), value: val, year })
    }

    return { daily: d, monthly: m, yearly: y }
  }, [])

  // Tính tổng theo today / this month / this year (demo)
  const emailsToday = daily[daily.length - 1]?.value ?? 0
  const emailsThisMonth = useMemo(() => daily.reduce((acc, it) => acc + it.value, 0), [daily])
  const emailsThisYear = useMemo(() => monthly.reduce((acc, it) => acc + it.value, 0), [monthly])

  // Granularity toggle
  const [mode, setMode] = useState<Granularity>('day')
  const chartData = mode === 'day' ? daily : mode === 'month' ? monthly : yearly
  const chartTitle =
    mode === 'day'
      ? 'Emails theo ngày (30 ngày gần nhất)'
      : mode === 'month'
        ? 'Emails theo tháng (12 tháng gần nhất)'
        : 'Emails theo năm (5 năm gần nhất)'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">UI demo – dữ liệu mô phỏng</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Tổng Templates" value={totalTemplates} />
        <StatCard title="Tổng Users" value={totalUsers} />
        <StatCard title="Emails hôm nay" value={emailsToday.toLocaleString('en-US')} />
        <StatCard
          title="Emails tháng này"
          value={emailsThisMonth.toLocaleString('en-US')}
          sub="Tổng 30 ngày gần nhất"
        />
      </div>

      {/* Chart + toggle granularity */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-medium">{chartTitle}</div>
          <div className="flex items-center gap-1 rounded-xl border p-1">
            <button
              onClick={() => setMode('day')}
              className={
                'px-3 py-1.5 rounded-lg text-sm ' +
                (mode === 'day' ? 'bg-black text-white' : 'hover:bg-gray-50')
              }
            >
              Ngày
            </button>
            <button
              onClick={() => setMode('month')}
              className={
                'px-3 py-1.5 rounded-lg text-sm ' +
                (mode === 'month' ? 'bg-black text-white' : 'hover:bg-gray-50')
              }
            >
              Tháng
            </button>
            <button
              onClick={() => setMode('year')}
              className={
                'px-3 py-1.5 rounded-lg text-sm ' +
                (mode === 'year' ? 'bg-black text-white' : 'hover:bg-gray-50')
              }
            >
              Năm
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'day' ? (
              <BarChart data={chartData as any[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            ) : mode === 'month' ? (
              <LineChart data={chartData as any[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" />
              </LineChart>
            ) : (
              <BarChart data={chartData as any[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tổng emails năm (12 tháng) */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-2 text-sm text-gray-500">Tổng emails năm nay (demo)</div>
        <div className="text-2xl font-bold">{emailsThisYear.toLocaleString('en-US')}</div>
      </div>
    </div>
  )
}
