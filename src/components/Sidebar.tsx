'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const items: Array<{ href: string; label: string; emoji: string }> = [
  { href: '/client/dashboard', label: 'Dashboard', emoji: '📊' },
  { href: '/client/templates', label: 'Email Templates', emoji: '🧩' },
  { href: '/client/send-email', label: 'Send Email', emoji: '✉️' },
  { href: '/client/contacts', label: 'Contacts', emoji: '👥' },
  { href: '/client/tracking', label: 'Tracking', emoji: '📚' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)
  return (
    <aside
      className={`h-screen sticky top-0 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
        open ? 'w-64' : 'w-16'
      } transition-all duration-300 z-40`}
    >
      <div className="h-14 flex items-center gap-2 px-3 border-b">
        <button
          className="p-2 rounded-xl hover:bg-gray-100"
          aria-label="Toggle sidebar"
          onClick={() => setOpen((v) => !v)}
        >
          <span>☰</span>
        </button>
        <span
          className={`font-semibold tracking-wide ${open ? 'opacity-100' : 'opacity-0 hidden'}`}
        >
          Client ABC
        </span>
      </div>
      <nav className="p-2 space-y-1">
        {items.map((it) => {
          const active = pathname?.startsWith(it.href)
          return (
            <Link key={it.href} href={it.href} className="block">
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  active ? 'bg-gray-900 text-white hover:bg-gray-900' : ''
                }`}
                title={it.label}
              >
                <span className="text-lg w-5 text-center">{it.emoji}</span>
                <span className={`${open ? 'block' : 'hidden'}`}>{it.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
        <div className={`text-xs text-gray-500 ${open ? 'block' : 'hidden'}`}>
          v0.1 – UI demo only
        </div>
      </div>
    </aside>
  )
}
