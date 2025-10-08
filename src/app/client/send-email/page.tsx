'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// --- Demo data (replace with your API data) ---
const TEMPLATE_OPTIONS = [
  {
    id: 'tpl-001',
    name: 'Promo Summer',
    thumb: '/images/templates/template1.png',
    full: '/images/templates/template1-full.png',
  },
  {
    id: 'tpl-002',
    name: 'Newsletter Minimal',
    thumb: '/images/templates/template2.png',
    full: '/images/templates/template2-full.png',
  },
  {
    id: 'tpl-003',
    name: 'Product Spotlight',
    thumb: '/images/templates/template3.png',
    full: '/images/templates/template3-full.png',
  },
]

const LIST_OPTIONS = [
  { id: 'list-001', name: 'All Subscribers (12,340)' },
  { id: 'list-002', name: 'VIP Customers (1,204)' },
  { id: 'list-003', name: 'Leads – Last 30 days (832)' },
]

const EMAILS = [
  { id: 'e1', email: 'alice@example.com', name: 'Alice' },
  { id: 'e2', email: 'bob@example.com', name: 'Bob' },
  { id: 'e3', email: 'cathy@example.com', name: 'Cathy' },
  { id: 'e4', email: 'david@example.com', name: 'David' },
  { id: 'e5', email: 'eva@example.com', name: 'Eva' },
  { id: 'e6', email: 'frank@example.com', name: 'Frank' },
]

// Stepper 4 bước
function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { id: 1, label: 'Choose template' },
    { id: 2, label: 'Pick recipients' },
    { id: 3, label: 'Details' },
    { id: 4, label: 'Review & send' },
  ] as const

  return (
    <ol className="mb-4 flex items-center gap-3 text-sm">
      {steps.map((s, idx) => {
        const isDone = s.id < step
        const isActive = s.id === step
        return (
          <li key={s.id} className="flex items-center gap-2">
            <div
              className={[
                'h-6 w-6 rounded-full border text-center text-xs font-semibold leading-6',
                isDone && 'bg-green-600 border-green-600 text-white',
                isActive && 'bg-indigo-600 border-indigo-600 text-white',
                !isDone && !isActive && 'border-slate-300 text-slate-500',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isDone ? '✓' : s.id}
            </div>
            <span className={isActive ? 'font-medium text-slate-900' : 'text-slate-500'}>
              {s.label}
            </span>
            {idx < steps.length - 1 && <span className="mx-2 text-slate-400">→</span>}
          </li>
        )
      })}
    </ol>
  )
}

export default function SendEmailPage() {
  const router = useRouter()
  const sp = useSearchParams()

  // State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([])
  const [showEmailPicker, setShowEmailPicker] = useState(false)
  const [draftEmailIds, setDraftEmailIds] = useState<string[]>([])

  const [subject, setSubject] = useState('')
  const [sendNow, setSendNow] = useState(true)
  const [scheduleAt, setScheduleAt] = useState<string>('') // local datetime
  const [isSending, setIsSending] = useState(false)

  // Initialize from query ?template=
  useEffect(() => {
    const t = sp.get('template')
    if (t) {
      // luôn luôn load template = 3 và nhảy Step 2
      setSelectedTemplateId('tpl-003')
      setStep(2)
    }
  }, [sp])

  const selectedTemplate = useMemo(
    () => TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplateId) || null,
    [selectedTemplateId]
  )

  const selectedList = useMemo(
    () => LIST_OPTIONS.find((l) => l.id === selectedListId) || null,
    [selectedListId]
  )

  // Validations
  const canNextFromStep1 = !!selectedTemplateId
  const canNextFromStep2 = !!selectedListId || selectedEmailIds.length > 0
  const canNextFromStep3 = subject.trim().length > 0 && (sendNow || !!scheduleAt)
  const canSend = !!selectedTemplateId && canNextFromStep2 && canNextFromStep3

  function handleNext() {
    if (step === 1 && canNextFromStep1) setStep(2)
    else if (step === 2 && canNextFromStep2) setStep(3)
    else if (step === 3 && canNextFromStep3) setStep(4)
  }

  function handleBack() {
    if (step === 4) setStep(3)
    else if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  async function handleSend() {
    if (!canSend) return
    setIsSending(true)

    const payload = {
      templateId: selectedTemplateId,
      listId: selectedListId,
      emails: selectedEmailIds, // nếu chọn từng email
      subject,
      scheduleAt: sendNow ? null : scheduleAt,
      sendNow,
    }

    console.log('SEND /api/email', payload)

    await new Promise((r) => setTimeout(r, 800))
    setIsSending(false)
    // router.push('/client/campaigns?sent=1')
  }

  // Email picker helpers
  function openEmailPicker() {
    setDraftEmailIds(selectedEmailIds)
    setShowEmailPicker(true)
  }
  function toggleDraftEmail(id: string) {
    setDraftEmailIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  function applyEmailPicker() {
    setSelectedEmailIds(draftEmailIds)
    setShowEmailPicker(false)
  }
  function clearIndividualEmails() {
    setSelectedEmailIds([])
  }

  const selectedEmails = useMemo(
    () => EMAILS.filter((e) => selectedEmailIds.includes(e.id)),
    [selectedEmailIds]
  )

  return (
    <div className="">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Send Email</h1>
      </div>

      <Stepper step={step} />

      {/* STEP 1: CHOOSE TEMPLATE */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="mb-3 text-sm font-medium text-slate-700">Choose template</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <label className="col-span-full text-sm text-slate-500">Pick one template</label>
            <select
              className="col-span-full rounded-xl border border-slate-300 p-2 text-sm"
              value={selectedTemplateId ?? ''}
              onChange={(e) => setSelectedTemplateId(e.target.value || null)}
            >
              <option value="">— Select a template —</option>
              {TEMPLATE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {TEMPLATE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className="flex flex-col items-stretch gap-2 rounded-xl border border-slate-200 p-3 text-left hover:shadow"
              >
                <img src={t.thumb} alt={t.name} className="h-28 w-full rounded-lg object-cover" />
                <div className="font-medium">{t.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!canNextFromStep1}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PICK RECIPIENTS */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left side: Template + Preview */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <h2 className="mb-3 text-sm font-medium text-slate-700">Template selected</h2>
                {selectedTemplate ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedTemplate.thumb}
                        alt={selectedTemplate.name}
                        className="h-10 w-16 rounded object-cover"
                      />
                      <div className="font-medium">{selectedTemplate.name}</div>
                    </div>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => setStep(1)}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No template selected.</p>
                )}
              </div>

              {/* Large preview */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700">Preview</h3>
                  {selectedTemplate && (
                    <Link
                      href={`/client/templates/view?template=${selectedTemplate.id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Open full
                    </Link>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {!selectedTemplate ? (
                    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                      Choose a template to preview
                    </div>
                  ) : (
                    <img
                      src={selectedTemplate.full}
                      alt={selectedTemplate.name}
                      className="mx-auto h-[520px] w-full max-w-[900px] rounded-lg object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Recipient list */}
            <div className="rounded-2xl border border-slate-200 p-4 h-fit">
              <h2 className="mb-3 text-sm font-medium text-slate-700">Recipient list</h2>
              <select
                className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                value={selectedListId ?? ''}
                onChange={(e) => setSelectedListId(e.target.value || null)}
              >
                <option value="">— Select a list —</option>
                {LIST_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">Or send to specific emails:</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={openEmailPicker}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Pick emails…
                </button>
                {selectedEmailIds.length > 0 && (
                  <button
                    type="button"
                    onClick={clearIndividualEmails}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Clear ({selectedEmailIds.length})
                  </button>
                )}
              </div>
              {selectedEmails.length > 0 && (
                <div className="mt-3 rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 text-xs font-medium text-slate-600">
                    Selected ({selectedEmails.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmails.slice(0, 6).map((e) => (
                      <span
                        key={e.id}
                        className="rounded-full border border-slate-300 px-2 py-1 text-xs"
                      >
                        {e.email}
                      </span>
                    ))}
                    {selectedEmails.length > 6 && (
                      <span className="text-xs text-slate-500">
                        +{selectedEmails.length - 6} more…
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canNextFromStep2}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETAILS */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-700">Details</h2>
          <div className="mb-4">
            <label className="mb-1 block text-sm text-slate-600">Subject</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-xl border border-slate-300 p-2 text-sm"
                placeholder="Write an engaging subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <button
                onClick={async () => {
                  const r = await fetch('/api/ai/subject', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      brand: 'YourBrand',
                      tone: 'promo',
                      audience: selectedListId,
                      templateSummary: selectedTemplate?.name,
                    }),
                  })
                  const { suggestions } = (await r.json()) as { suggestions: string[] }
                  if (suggestions?.length) {
                    setSubject(suggestions[0]) // 👉 gán suggestion đầu tiên vào input
                  }
                }}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                ✨ Generate
              </button>
            </div>
          </div>

          <div className="mb-4 space-y-2 rounded-xl border border-slate-200 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
              />
              Send immediately
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Schedule at</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  disabled={sendNow}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Local time will be converted to UTC on server.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Time zone</label>
                <input
                  type="text"
                  className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-50 p-2 text-sm"
                  value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canNextFromStep3}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SEND */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="mb-4 text-sm font-medium text-slate-700">Review</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                {selectedTemplate && (
                  <img
                    src={selectedTemplate.thumb}
                    alt={selectedTemplate.name}
                    className="h-12 w-20 rounded object-cover"
                  />
                )}
                <div>
                  <div className="text-xs text-slate-500">Template</div>
                  <div className="font-medium">{selectedTemplate?.name || '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Recipient list</div>
                <div className="font-medium">{selectedList?.name || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Individual emails</div>
                <div className="font-medium">{selectedEmailIds.length} selected</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Subject</div>
                <div className="font-medium">{subject || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Send time</div>
                <div className="font-medium">
                  {sendNow ? 'Send immediately' : scheduleAt || '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend || isSending}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Sending…' : sendNow ? 'Send now' : 'Schedule send'}
            </button>
          </div>
        </div>
      )}

      {/* Email picker modal */}
      {showEmailPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEmailPicker(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Pick emails</h3>
              <button
                className="text-slate-500 hover:underline"
                onClick={() => setShowEmailPicker(false)}
              >
                ✕
              </button>
            </div>
            <div className="mb-3 flex items-center gap-2 text-xs">
              <button
                className="rounded border border-slate-300 px-2 py-1"
                onClick={() => setDraftEmailIds(EMAILS.map((e) => e.id))}
              >
                Select all
              </button>
              <button
                className="rounded border border-slate-300 px-2 py-1"
                onClick={() => setDraftEmailIds([])}
              >
                Clear
              </button>
            </div>
            <div className="max-h-80 overflow-auto rounded border border-slate-200">
              {EMAILS.map((e) => (
                <label
                  key={e.id}
                  className="flex items-center gap-2 border-b border-slate-100 p-2 text-sm last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={draftEmailIds.includes(e.id)}
                    onChange={() => toggleDraftEmail(e.id)}
                  />
                  <span className="font-medium">{e.email}</span>
                  <span className="text-xs text-slate-500">({e.name})</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                onClick={() => setShowEmailPicker(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                onClick={applyEmailPicker}
              >
                Apply ({draftEmailIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
