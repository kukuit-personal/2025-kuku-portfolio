import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'grapesjs/dist/css/grapes.min.css'
import NavbarLeft from '@/components/NavbarLeft'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KukuIt | Worklog',
  description: 'KukuIt Worklog System',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Checkbox để toggle sidebar trên mobile (CSS-only) */}
        <input id="nav-toggle" type="checkbox" className="peer sr-only" />

        <div className="min-h-screen flex">
          {/* Sidebar (off-canvas mobile, narrow desktop) */}
          <NavbarLeft />

          {/* Main area */}
          <div className="flex-1 flex flex-col">
            {/* Header Top */}
            <HeaderTop />

            {/* Content */}
            <div>{children}</div>
          </div>
        </div>

        {/* Backdrop khi mở sidebar trên mobile */}
        <label
          htmlFor="nav-toggle"
          className="fixed inset-0 bg-black/30 z-40 hidden peer-checked:block sm:hidden"
          aria-hidden="true"
        />
      </body>
    </html>
  )
}

/** ---------------- Header Top (giữ nguyên + hamburger mobile) ---------------- */
function HeaderTop() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="h-12 max-w-7xl mx-auto px-3 sm:px-4 flex items-center">
        {/* Hamburger chỉ hiện trên mobile */}
        <label
          htmlFor="nav-toggle"
          aria-label="Open menu"
          className="sm:hidden mr-1 inline-grid place-items-center w-7 h-7 rounded-md hover:bg-gray-100"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-700">
            <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z" />
          </svg>
        </label>

        {/* Left: icon app (K) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 grid place-items-center text-white text-[10px] font-bold">
            K
          </div>
        </div>

        {/* Center: search */}
        <div className="flex-1 flex justify-center px-3">
          <div className="w-full max-w-3xl relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-400">
                <path fill="currentColor" d="M10 18a7.96 7.96 0 0 0 4.9-1.7l4.4 4.4l1.4-1.4l-4.4-4.4A8 8 0 1 0 10 18m0-2a6 6 0 1 1 0-12a6 6 0 0 1 0 12"/>
              </svg>
            </span>
            <input
              className="w-full rounded-md border pl-8 pr-3 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring"
              placeholder="Tìm kiếm (Ctrl+Alt+E)"
            />
          </div>
        </div>

        {/* Right: more + avatar */}
        <div className="flex items-center gap-2">
          <button
            aria-label="More"
            className="h-7 w-7 grid place-items-center rounded-md hover:bg-gray-100 text-gray-600"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3">
              <path fill="currentColor" d="M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/>
            </svg>
          </button>

          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-amber-300 grid place-items-center text-[10px] font-semibold text-gray-700">
              KH
            </div>
            <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white"></span>
          </div>
        </div>
      </div>
    </header>
  )
}
