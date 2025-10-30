'use client'

import {
  MonitorPlay,
  Code,
  Database,
  Smartphone,
  Gamepad2,
  FlaskConical,
  ChevronRight,
} from 'lucide-react'
import { motion, type Variants } from 'framer-motion'

/**
 * Mobile-first improvements:
 * - Quick Nav: horizontally scrollable chips with scroll-snap; sticky on mobile.
 * - Sections: add scroll-mt to avoid header overlap; tighter spacing on mobile.
 * - Gallery: mobile uses horizontal carousel (snap) for thumb cards; grid from sm: breakpoint.
 * - Larger tap targets; smaller motion on mobile; reduce layout shift with aspect ratio boxes.
 */

const CONTAINER = 'max-w-6xl mx-auto px-4 md:px-6'

// Easing & reusable variants (aligned with About page style)
const easeOutExpo = [0.16, 1, 0.3, 1] as const

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

type Section = {
  key: string
  title: string
  note: string
  Icon: any
  images: { src: string; alt?: string }[]
}

const sections: Section[] = [
  {
    key: 'web',
    title: 'Web Development',
    note: 'Next.js 14.2.3, React, Tailwind, TanStack Query, Neon PostgreSQL. Focus on performance, DX, and clean architecture.',
    Icon: Code,
    images: [
      { src: '/images/projects/web/sample-1.jpg', alt: 'Web sample 1' },
      { src: '/images/projects/web/sample-2.jpg', alt: 'Web sample 2' },
      { src: '/images/projects/web/sample-3.jpg', alt: 'Web sample 3' },
    ],
  },
  {
    key: 'backend',
    title: 'Backend',
    note: 'NestJS, Prisma, MySQL/PostgreSQL. RESTful APIs, auth, RBAC, production-ready patterns.',
    Icon: Database,
    images: [
      { src: '/images/projects/backend/sample-1.jpg' },
      { src: '/images/projects/backend/sample-2.jpg' },
      { src: '/images/projects/backend/sample-3.jpg' },
    ],
  },
  {
    key: 'edetailing',
    title: 'eDetailing Apps',
    note: 'Standard app, Veeva, OCE, M-detail. High‑polish presentations for medical/marketing.',
    Icon: MonitorPlay,
    images: [
      { src: '/images/projects/edetailing/sample-1.jpg' },
      { src: '/images/projects/edetailing/sample-2.jpg' },
      { src: '/images/projects/edetailing/sample-3.jpg' },
    ],
  },
  {
    key: 'interactive',
    title: 'Interactive Media',
    note: 'Landing pages, email templates, video interactive, mini games (H5, Cocos Creator).',
    Icon: Gamepad2,
    images: [
      { src: '/images/projects/interactive/sample-1.jpg' },
      { src: '/images/projects/interactive/sample-2.jpg' },
      { src: '/images/projects/interactive/sample-3.jpg' },
    ],
  },
  {
    key: 'hybrid',
    title: 'Hybrid Mobile',
    note: 'Android / iOS (Flutter, Capacitor). Shipping fast with native‑like UX.',
    Icon: Smartphone,
    images: [
      { src: '/images/projects/hybrid/sample-1.jpg' },
      { src: '/images/projects/hybrid/sample-2.jpg' },
      { src: '/images/projects/hybrid/sample-3.jpg' },
    ],
  },
  {
    key: 'research',
    title: 'Research & Tech',
    note: 'Exploration, POCs, and choosing the right tools for real‑world constraints.',
    Icon: FlaskConical,
    images: [
      { src: '/images/projects/research/sample-1.jpg' },
      { src: '/images/projects/research/sample-2.jpg' },
      { src: '/images/projects/research/sample-3.jpg' },
    ],
  },
]

export default function ProjectPage() {
  return (
    <main className="pb-24">
      {/* Hero / Heading */}
      <section className={`pt-10 md:pt-16 ${CONTAINER}`}>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-4xl font-bold text-slate-900"
        >
          Projects
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 md:mt-3 text-slate-600 max-w-2xl text-sm md:text-base"
        >
          Six core areas. Each section includes a short note and a small gallery of demo images.
        </motion.p>
      </section>

      {/* Quick Nav (sticky on mobile) */}
      <section className="mt-4 md:mt-6">
        <div
          className={`${CONTAINER} md:static sticky top-12 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 md:bg-transparent overflow-x-auto`}
        >
          <motion.ul
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex items-center gap-2 md:gap-3 py-2 snap-x snap-mandatory"
          >
            {sections.map((s) => (
              <motion.li key={`nav-${s.key}`} variants={fadeInUp} className="snap-start">
                <a
                  href={`#${s.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 md:px-4 py-2 text-sm md:text-base text-slate-700 hover:bg-emerald-50 transition min-h-10"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                    <s.Icon className="h-4 w-4 text-emerald-700" />
                  </span>
                  {s.title}
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Sections */}
      <div className="mt-6 md:mt-10">
        {sections.map((s, idx) => {
          const altBg = idx % 2 === 1
          return (
            <section
              id={s.key}
              key={s.key}
              className={(altBg ? 'bg-emerald-50/50' : 'bg-white') + ' py-8 md:py-14 scroll-mt-24'}
            >
              <div className={CONTAINER}>
                <motion.div
                  variants={staggerParent}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                >
                  <motion.div variants={fadeInUp} className="flex items-start gap-3 md:gap-4">
                    <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <s.Icon className="h-5 w-5 text-emerald-700" />
                    </span>
                    <div>
                      <h2 className="text-lg md:text-2xl font-semibold text-slate-900">
                        {s.title}
                      </h2>
                      <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed">
                        {s.note}
                      </p>
                    </div>
                  </motion.div>

                  {/* Gallery: mobile carousel (snap), grid from sm: */}
                  <motion.div variants={fadeInUp} className="mt-5">
                    <div className="sm:hidden -mx-4 px-4">
                      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
                        {s.images.map((img, i) => (
                          <div
                            key={`${s.key}-m-${i}`}
                            className="relative shrink-0 w-[78%] aspect-[4/3] snap-center overflow-hidden rounded-xl border border-emerald-200 bg-white"
                            title={img.alt || s.title}
                          >
                            <img
                              src={img.src}
                              alt={img.alt || s.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {s.images.map((img, i) => (
                        <div
                          key={`${s.key}-${i}`}
                          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-emerald-200 bg-white"
                          title={img.alt || s.title}
                        >
                          {/* Using <img> so broken paths simply show background; replace with your real images later */}
                          <img
                            src={img.src}
                            alt={img.alt || s.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* View more: appears with fade, subtle hover nudge */}
                  <motion.div variants={fadeInUp} className="mt-6">
                    <motion.a
                      variants={fadeInUp}
                      href={`/project/${s.key}`}
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-medium hover:underline"
                      whileHover={{ x: 2 }}
                    >
                      View more <ChevronRight className="h-4 w-4" />
                    </motion.a>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
