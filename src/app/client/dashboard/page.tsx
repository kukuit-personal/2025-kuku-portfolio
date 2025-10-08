'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

export default function Dashboard() {
  // Mock data ổn định: 30 ngày gần nhất
  const daily = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - idx))
    // giá trị mô phỏng, dao động nhẹ cho đẹp
    const base = 120
    const wobble = ((idx * 7) % 35) + Math.round(Math.sin(idx / 3) * 12)
    return {
      name: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      emails: base + wobble,
    }
  })

  return (
    <main className="space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Templates" value="12" note="đang lưu" />
        <Stat title="Chiến dịch" value="3" note="đang chạy" />
        <Stat title="Tỉ lệ mở" value="28%" note="7 ngày qua" />
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white shadow-sm border p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="font-medium">Emails theo ngày (30 ngày gần nhất)</div>
          <div className="text-xs text-gray-500">UI demo</div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="emails" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}

function Stat({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5 border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{note}</div>
    </div>
  )
}
