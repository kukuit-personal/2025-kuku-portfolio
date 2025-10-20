export function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
      <path
        fill="currentColor"
        d="M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
      />
    </svg>
  )
}
export function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.51-2.51a.9959.9959 0 1 0-1.41 1.41l2.51 2.51c.4.39 1.03.39 1.41 0Z"
      />
    </svg>
  )
}
export function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M9 3h6v2h5v2H4V5h5zm1 6h2v8h-2zm4 0h2v8h-2z" />
    </svg>
  )
}
export function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  )
}
export function SaveIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
      />
    </svg>
  )
}
export function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="m10 17l5-5l-5-5v10z" />
    </svg>
  )
}
export function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="m7 10l5 5l5-5H7z" />
    </svg>
  )
}
export { EllipsisVertical as EllipsisVerticalIcon } from 'lucide-react'
