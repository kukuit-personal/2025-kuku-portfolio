// components/HealthLogTable.tsx
'use client'
import type { HealthLogProps } from '../types'
import HealthLogTableDesktop from './LogTableDesktop'
import HealthLogListMobile from './LogListMobile'

export default function HealthLogTable(props: HealthLogProps) {
  return (
    <div className="rounded-md border bg-white">
      {/* Mobile (<lg) */}
      <div className="lg:hidden">
        <HealthLogListMobile {...props} />
      </div>

      {/* Desktop (≥lg) */}
      <div className="hidden lg:block">
        <HealthLogTableDesktop {...props} />
      </div>
    </div>
  )
}
