import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'grapesjs/dist/css/grapes.min.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ainka Email Platform',
  description: 'UI demo – Mail platform',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex min-h-screen">
          {/* <Sidebar /> */}
          <div className="flex-1">
            <Topbar />
            <div className="p-6">{children}</div>
          </div>
        </div>
      </body>
    </html>
  )
}

function Topbar() {
  return (
    <header className="h-14 sticky top-0 z-30 bg-white/80 backdrop-blur border-b flex items-center px-4 justify-between">
      <div className="text-sm text-gray-500">Email Platform</div>
      <div className="flex items-center gap-3">
        <input
          className="rounded-xl border px-3 py-1 text-sm focus:outline-none focus:ring w-56"
          placeholder="Tìm nhanh..."
        />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
      </div>
    </header>
  )
}
