'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

/** ---------------- Minimal inline icons ---------------- */
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1z"/>
    </svg>
  )
}
function BubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"/>
    </svg>
  )
}
function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3s1.34 3 3 3M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5S5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V20h14v-1.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05C16.65 13.9 18 15 18 16.5V20h4v-1.5c0-2.33-4.67-3.5-6-3.5Z"/>
    </svg>
  )
}
function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M10 2h4a2 2 0 0 1 2 2v2h4v14H4V6h4V4a2 2 0 0 1 2-2m0 4h4V4h-4z"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H5V10h14z"/>
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57c-.35-.12-.75-.03-1.02.24l-2.2 2.2a15.05 15.05 0 0 1-6.58-6.58l2.2-2.2c.27-.27.36-.67.24-1.02A11.44 11.44 0 0 1 8.5 4H6a2 2 0 0 0-2 2c0 8.28 6.72 15 15 15a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-1-1"/>
    </svg>
  )
}
function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current">
      <path d="M19 18H6a4 4 0 1 1 1.33-7.78A6 6 0 0 1 22 12a4 4 0 0 1-3 6"/>
    </svg>
  )
}

/** ---------------- Button vuông có tooltip ---------------- */
function SquareNavButton({
  href,
  label,
  active,
  children,
}: {
  href: string
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={[
        // Mobile: full width, có label
        'w-full rounded-md px-2 py-2 flex items-center gap-2 hover:bg-white',
        // Desktop: ô vuông + tooltip
        'sm:w-[56px] sm:h-[56px] sm:p-0 sm:flex sm:items-center sm:justify-center sm:relative sm:group',
        active ? 'bg-white ring-1 ring-indigo-200' : '',
      ].join(' ')}
    >
      {/* thanh active trái (desktop) */}
      <span
        className={[
          'hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r',
          active ? 'bg-indigo-600' : 'bg-transparent',
        ].join(' ')}
      />
      {/* icon box */}
      <span
        className={[
          'grid place-items-center rounded-md border',
          'w-9 h-9',
          active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200',
        ].join(' ')}
        aria-hidden="true"
      >
        {children}
      </span>
      {/* label mobile */}
      <span className="text-xs text-gray-700 sm:hidden">{label}</span>
      {/* tooltip desktop */}
      <span
        className={[
          'hidden sm:block',
          'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
          'absolute left-[66px] top-1/2 -translate-y-1/2',
          'whitespace-nowrap text-[11px] font-medium',
          'bg-gray-900 text-white px-2.5 py-1 rounded-md shadow',
        ].join(' ')}
        role="tooltip"
      >
        {label}
      </span>
    </Link>
  )
}

/** ---------------- Navbar Left (auto-active theo pathname) ---------------- */
export default function NavbarLeft() {
  const pathname = usePathname() || '/'

  const groups = [
    {
      key: 'core',
      items: [
        { key: 'activity', label: 'Hoạt động', icon: BellIcon, href: '/activity' },
        { key: 'chat', label: 'Trò chuyện', icon: BubbleIcon, href: '/chat' },
      ],
    },
    {
      key: 'work',
      items: [
        { key: 'teams', label: 'Nhóm', icon: PeopleIcon, href: '/teams' },
        { key: 'tasks', label: 'Nhiệm vụ', icon: BriefcaseIcon, href: '/tasks' },
        { key: 'calendar', label: 'Lịch Outlook', icon: CalendarIcon, href: '/calendar' },
      ],
    },
    {
      key: 'etc',
      items: [
        { key: 'calls', label: 'Các Cuộc gọi', icon: PhoneIcon, href: '/calls' },
        { key: 'drive', label: 'OneDrive', icon: CloudIcon, href: '/drive' },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    // active nếu pathname bắt đầu bằng href (đảm bảo khớp segment đầu)
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={[
        // Mobile off-canvas
        'fixed inset-y-0 left-0 z-50 w-64 p-3 bg-gray-100 border-r',
        'transform -translate-x-full transition-transform duration-200',
        'peer-checked:translate-x-0',
        // Desktop narrow
        'sm:static sm:translate-x-0 sm:w-[72px] sm:p-2',
        'flex flex-col items-center gap-3'
      ].join(' ')}
    >
      {/* header nhỏ mobile */}
      <div className="w-full flex items-center justify-between sm:hidden mb-1">
        <div className="text-xs font-medium text-gray-700">Menu</div>
        <label
          htmlFor="nav-toggle"
          aria-label="Close menu"
          className="inline-grid place-items-center w-8 h-8 rounded-md hover:bg-gray-200"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-700">
            <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/>
          </svg>
        </label>
      </div>

      <nav className="w-full sm:w-auto sm:flex sm:flex-col sm:items-center sm:gap-3 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={group.key} className="w-full sm:w-auto">
            {gi > 0 && <div className="hidden sm:block h-px bg-gray-200 my-2" />}
            <div className="grid grid-cols-1 gap-1 sm:gap-2">
              {group.items.map(({ key, label, icon: Icon, href }) => (
                <SquareNavButton key={key} href={href} label={label} active={isActive(href)}>
                  <Icon />
                </SquareNavButton>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
