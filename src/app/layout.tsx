import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'grapesjs/dist/css/grapes.min.css'
import NavbarLeft from '@/components/NavbarLeft'
import HeaderTop from '@/components/HeaderTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KukuIt | Worklog',
  description: 'KukuIt Worklog System',
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#f9fafb',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Define your color scheme as light only to avoid flash when toggling dark mode */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
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
