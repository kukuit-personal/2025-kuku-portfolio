'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import {
  Code,
  Smartphone,
  FlaskConical,
  Database,
  MonitorPlay,
  Layout,
  Mail,
  ChevronRight,
} from 'lucide-react'

export default function AboutPage() {
  const container = 'max-w-6xl mx-auto px-4 md:px-6'

  // cubic-bezier thay cho 'easeOut' string để hợp TypeScript
  const easeOutExpo = [0.16, 1, 0.3, 1] as const

  // Variants tái sử dụng
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOutExpo },
    },
  }

  const staggerParent: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  }

  const skillItems = [
    {
      title: 'Web Development',
      desc: 'Next.js, React, Tailwind, TanStack Query, Neon PostgreSQL. Focus on performance, DX, and clean architecture.',
      Icon: Code,
    },
    {
      title: 'Backend',
      desc: 'NestJS, Prisma, MySQL/PostgreSQL. RESTful APIs, auth, RBAC, and production-ready patterns.',
      Icon: Database,
    },
    {
      title: 'eDetailing Apps',
      desc: 'Standard app, Veeva, OCE, M-detail. High-polish presentations for medical/marketing.',
      Icon: Layout,
    },
    {
      title: 'Interactive Media',
      desc: 'Landing pages, email templates, video interactive, mini games (H5, Cocos Creator).',
      Icon: MonitorPlay,
    },
    {
      title: 'Hybrid Mobile',
      desc: 'Android / iOS (Flutter, Capacitor). Shipping fast with native-like UX.',
      Icon: Smartphone,
    },
    {
      title: 'Research & Tech',
      desc: 'Exploration, POCs, and choosing the right tools for real-world constraints.',
      Icon: FlaskConical,
    },
  ]

  const tools = [
    'React',
    'Next.js 14',
    'Tailwind CSS',
    'TanStack Query',
    'Prisma',
    'Neon/PostgreSQL',
    'MySQL',
    'NestJS',
    'Vercel',
    'Cloudinary/S3',
    'Cocos Creator',
    'Flutter',
  ]

  return (
    <main className="pb-24">
      {/* Hero */}
      <section className={`${container} pt-12 md:pt-16`}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center md:justify-start md:block"
          >
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: easeOutExpo }}
              whileHover={{ scale: 1.05 }}
              className="relative w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-emerald-200 overflow-hidden shadow-md"
            >
              <Image
                src="/images/avatar.jpg"
                alt="Khang Huynh portrait"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 112px, 144px"
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-sm tracking-wide uppercase text-emerald-600 font-semibold text-center md:text-left">
              Software Engineer · Web Developer · Game Developer - Vietnam
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold leading-tight text-center md:text-left">
              Khang Huynh
            </h1>
            <p className="mt-4 text-slate-600 max-w-prose text-center md:text-left">
              I build modern web apps, creative eDetailing, and interactive experiences for
              marketing and education. I care about performance, maintainability, and delightful
              UIs.
            </p>

            <div className="mt-6 flex flex-wrap justify-center md:justify-start items-center gap-3">
              <Link
                href="/project"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition"
              >
                View Projects <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition"
              >
                <Mail className="w-4 h-4" /> Contact Me
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary */}
      <section className="mt-12 md:mt-16">
        <div className={`${container} grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">Professional Summary</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              With years of experience delivering web and interactive digital products, I focus on
              high-performance engineering and clean architecture. My work spans eDetailing
              presentations, landing pages, hybrid apps, and mini-games. I partner with teams to
              ship maintainable solutions and iterate quickly based on real usage.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Availability:</span> Open to freelance & remote
              projects.
            </p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold">Location:</span> Vietnam (GMT+7)
            </p>
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold">Languages:</span> Vietnamese, English
            </p>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="mt-16 bg-emerald-50/50 py-12">
        <div className={container}>
          <h2 className="text-xl font-semibold">Core Skills & Expertise</h2>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {skillItems.map(({ title, desc, Icon }) => (
              <motion.div
                key={title}
                variants={fadeInUp}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </span>
                  <h3 className="text-base font-semibold">{title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools & Tech */}
      <section className="mt-16">
        <div className={container}>
          <h2 className="text-xl font-semibold">Tools & Tech Stack</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {tools.map((t) => (
              <li
                key={t}
                className="text-sm px-3 py-1 rounded-full border border-emerald-200 bg-white text-slate-700"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Experience Highlights */}
      <section className="mt-16">
        <div className={container}>
          <h2 className="text-xl font-semibold">Experience Highlights</h2>
          <ul className="mt-4 space-y-3 text-slate-700">
            <li className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Developed multiple <span className="font-medium">eDetailing apps</span> for
                pharmaceutical marketing teams.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Built responsive <span className="font-medium">landing pages</span> and{' '}
                <span className="font-medium">email templates</span> for digital campaigns.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                Created <span className="font-medium">interactive mini-games</span> to engage users
                and collect data.
              </span>
            </li>
          </ul>

          <div className="mt-6">
            <Link
              href="/project"
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline"
            >
              Browse Projects <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-16 bg-emerald-50/70 py-12">
        <div className={container}>
          <h2 className="text-xl font-semibold">Testimonials</h2>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <motion.blockquote
              variants={fadeInUp}
              className="rounded-2xl border border-emerald-100 bg-white p-5 text-slate-700"
            >
              <p>“Reliable and delivers high-quality interactive content on time.”</p>
              <footer className="mt-3 text-sm text-slate-500">- Agency Partner</footer>
            </motion.blockquote>

            <motion.blockquote
              variants={fadeInUp}
              className="rounded-2xl border border-emerald-100 bg-white p-5 text-slate-700"
            >
              <p>“Understands marketing goals and translates them into polished UX.”</p>
              <footer className="mt-3 text-sm text-slate-500">- Product Owner</footer>
            </motion.blockquote>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className={`${container} text-center`}>
          <h2 className="text-2xl font-bold">Let’s build something creative together</h2>
          <p className="mt-3 text-slate-600">I’m open for freelance or remote projects.</p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Mail className="w-4 h-4" /> Contact Me
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
