'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Info, FolderKanban, Mail } from 'lucide-react'

type Item = { label: string; href: string; icon: React.ReactNode }

const NAV_ITEMS: Item[] = [
  { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
  { label: 'About', href: '/about', icon: <Info className="w-4 h-4" /> },
  { label: 'Project', href: '/project', icon: <FolderKanban className="w-4 h-4" /> },
  { label: 'Contact', href: '/contact', icon: <Mail className="w-4 h-4" /> },
]

const CONTAINER = 'max-w-6xl mx-auto px-4'

function NavItem({
  href,
  label,
  icon,
  isActive,
  onClick,
  isMobile = false,
}: {
  href: string
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick?: () => void
  isMobile?: boolean
}) {
  const base =
    'flex items-center gap-2 px-3 py-2 text-[15px] sm:text-base font-medium transition-colors focus:outline-none focus-visible:ring-0'

  // Desktop: border-bottom (giữ nguyên)
  const desktop =
    'hidden sm:flex border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-emerald-300'
  const desktopActive = 'border-emerald-500 text-gray-900'

  // Mobile: border-left + bg xanh nhạt, không rounded
  const mobile =
    'sm:hidden border-l-2 border-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100'
  const mobileActive = 'border-emerald-500 bg-emerald-50 text-gray-900'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        base,
        isMobile ? mobile : desktop,
        isActive ? (isMobile ? mobileActive : desktopActive) : '',
      ].join(' ')}
    >
      <span
        className={isActive ? 'text-emerald-600' : 'text-gray-500 group-hover:text-emerald-600'}
      >
        {icon}
      </span>
      {label}
    </Link>
  )
}

export default function HeaderTop() {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className={`${CONTAINER} h-14 flex items-center gap-2`}>
        {/* Hamburger (mobile) */}
        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-grid place-items-center w-10 h-10 hover:bg-gray-100"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-700">
            <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z" />
          </svg>
        </button>

        {/* Nav (desktop) */}
        <nav className="ml-2 hidden sm:flex items-stretch justify-start">
          <div className="flex h-14 items-end gap-3">
            {NAV_ITEMS.map((it) => (
              <NavItem
                key={it.href}
                href={it.href}
                label={it.label}
                icon={it.icon}
                isActive={isActive(it.href)}
              />
            ))}
          </div>
        </nav>

        {/* Right: avatar */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 grid place-items-center text-[10px] font-semibold text-white bg-gradient-to-br from-cyan-400 to-lime-500 rounded-full">
              KH
            </div>
            <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 bg-emerald-500 ring-2 ring-white rounded-full"></span>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t bg-white/95 backdrop-blur">
          <div className={`${CONTAINER}`}>
            <nav className="flex flex-col py-1">
              {NAV_ITEMS.map((it) => (
                <NavItem
                  key={it.href}
                  href={it.href}
                  label={it.label}
                  icon={it.icon}
                  isActive={isActive(it.href)}
                  isMobile
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
