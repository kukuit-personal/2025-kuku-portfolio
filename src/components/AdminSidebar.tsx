'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin/dashboard', label: 'Dashboard', emoji: '📊' },
  { href: '/admin/users', label: 'Users', emoji: '👤' },
  { href: '/admin/templates', label: 'Templates', emoji: '🧩' },
  { href: '/admin/apis/vault', label: 'Connect', emoji: '🔌' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="h-screen sticky top-0 w-60 border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-14 flex items-center px-4 border-b font-semibold">Admin</div>
      <nav className="p-2 space-y-1">
        {items.map((it) => {
          const active = pathname?.startsWith(it.href)
          return (
            <Link key={it.href} href={it.href} className="block">
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  active ? 'bg-gray-900 text-white hover:bg-gray-900' : ''
                }`}
              >
                <span className="text-lg w-5 text-center">{it.emoji}</span>
                <span>{it.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
