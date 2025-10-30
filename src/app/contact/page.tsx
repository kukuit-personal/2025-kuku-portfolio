'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import {
  Mail,
  Linkedin,
  Github,
  Phone,
  MapPin,
  Clock,
  Globe2,
  ChevronRight,
  Send,
} from 'lucide-react'
import { useState } from 'react'

const CONTAINER = 'max-w-6xl mx-auto px-4 md:px-6'

// Reusable animation (aligned with About/Project pages)
const easeOutExpo = [0.16, 1, 0.3, 1] as const

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export default function ContactPage() {
  // Form state (demo only)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // TODO: wire up to your backend (NestJS/Resend/Formspree...). For now, just simulate.
      await new Promise((r) => setTimeout(r, 900))
      alert('Thanks! Your message has been captured on this demo page.')
      ;(e.currentTarget as HTMLFormElement).reset()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pb-24">
      {/* Hero */}
      <section className={`pt-12 md:pt-16 ${CONTAINER}`}>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-slate-900"
        >
          Contact
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-slate-600 max-w-2xl"
        >
          Get in touch with <span className="font-medium">Khang Huynh</span>. I’m open to freelance
          & remote projects.
        </motion.p>
      </section>

      {/* Content */}
      <section className="mt-8 bg-emerald-50/50 py-10 md:py-14">
        <div className={`${CONTAINER} grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10`}>
          {/* Left: Contact channels */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              Contact Channels
            </motion.h2>

            <motion.ul variants={fadeInUp} className="mt-4 space-y-3">
              {/* Email - primary */}
              <li>
                <Link
                  href="mailto:hi@khanghuynh.dev" // TODO: change to your actual email
                  className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Mail className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-sm text-slate-600 group-hover:underline">
                      hi@khanghuynh.dev
                    </p>
                  </div>
                </Link>
              </li>

              {/* LinkedIn */}
              <li>
                <a
                  href="https://www.linkedin.com/in/your-link" // TODO
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Linkedin className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">LinkedIn</p>
                    <p className="text-sm text-slate-600 group-hover:underline">
                      linkedin.com/in/your-link
                    </p>
                  </div>
                </a>
              </li>

              {/* GitHub */}
              <li>
                <a
                  href="https://github.com/kukuit-personal" // TODO: confirm account
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Github className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">GitHub</p>
                    <p className="text-sm text-slate-600 group-hover:underline">
                      github.com/kukuit-personal
                    </p>
                  </div>
                </a>
              </li>

              {/* Optional: Phone/Zalo/Telegram (comment out if not used) */}
              <li>
                <a
                  href="tel:+84XXXXXXXXX" // TODO: add your number or remove this block
                  className="group flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 hover:bg-emerald-50 transition"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <Phone className="h-5 w-5 text-emerald-700" />
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">Phone / Zalo</p>
                    <p className="text-sm text-slate-600">+84 XX XXX XXXX</p>
                  </div>
                </a>
              </li>
            </motion.ul>

            {/* Info chips */}
            <motion.div variants={fadeInUp} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-700" /> Ho Chi Minh City, Vietnam
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                <Clock className="h-4 w-4 text-emerald-700" /> GMT+7 (Vietnam)
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                <Globe2 className="h-4 w-4 text-emerald-700" /> Vietnamese, English
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-700">
                <Send className="h-4 w-4 text-emerald-700" /> Availability: Freelance & Remote
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              Send a Message
            </motion.h2>

            <motion.form
              variants={fadeInUp}
              onSubmit={onSubmit}
              className="mt-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    name="name"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Project Type</label>
                  <select
                    name="projectType"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    defaultValue="web"
                  >
                    <option value="web">Web</option>
                    <option value="edetailing">eDetailing</option>
                    <option value="game">Mini Game</option>
                    <option value="app">Hybrid App</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Budget (optional)</label>
                  <input
                    name="budget"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="$1k - $3k"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Tell me about your project..."
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" /> {submitting ? 'Sending…' : 'Send Message'}
                </button>
                <a
                  href="mailto:hi@khanghuynh.dev" // TODO: change email
                  className="inline-flex items-center gap-1.5 text-emerald-700 font-medium hover:underline"
                >
                  Or email me <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Notes for implementation */}
              <p className="mt-4 text-xs text-slate-500">
                *This is a demo form. Hook it to your API (NestJS + Resend/Mailgun) or a service
                like Formspree.
              </p>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
