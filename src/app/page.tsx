// app/page.tsx (or app/portfolio/page.tsx)
// Next.js 14 App Router + TailwindCSS
// Single-file portfolio page for KukuIt — English content

import {
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Briefcase,
  Code2,
  ExternalLink,
  MapPin,
} from 'lucide-react'

export const metadata = {
  title: 'KukuIt - Portfolio',
  description:
    'Portfolio of KukuIt - Web Developer (Next.js, Tailwind, TanStack Query, Neon Postgres)',
}

const skills = [
  'JavaScript/TypeScript',
  'React.js / Next.js 14',
  'Tailwind CSS',
  'TanStack Query',
  'Node.js / NestJS',
  'PostgreSQL / Neon',
  'Prisma ORM',
  'REST APIs',
  'Git / GitHub',
]

// Placeholder projects — replace `projects` with real items later
const projects: Array<{
  id: string
  name: string
  summary: string
  tags: string[]
  href?: string
  image?: string
}> = [
  {
    id: 'p1',
    name: 'Worklog App',
    summary:
      'Time-tracking demo with sessions, daily totals, and soft-delete. Built on Next.js 14 + Prisma + Neon.',
    tags: ['Next.js', 'Prisma', 'Neon', 'Tailwind'],
    href: '#',
  },
  {
    id: 'p2',
    name: 'HealthLog',
    summary:
      'Personal health tracker: calories, weight, and daily activities with filters and pagination.',
    tags: ['React', 'Next.js', 'UI'],
    href: '#',
  },
  {
    id: 'p3',
    name: 'Todos Module',
    summary:
      'CRUD with filters, query-state sync, and clean table UX. Ready to connect to real API.',
    tags: ['TanStack Query', 'React', 'UX'],
    href: '#',
  },
]

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-orange-300/60" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-indigo-300/60" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 backdrop-blur">
                <MapPin className="h-3.5 w-3.5" /> Viet Nam · Open to Work
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">KukuIt</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
                Web Developer focused on building fast, maintainable user interfaces and pragmatic
                backends. I work primarily with <strong>Next.js 14</strong>,{' '}
                <strong>Tailwind CSS</strong>, and <strong>TanStack Query</strong>, and I ship
                data-backed features with <strong>Prisma</strong> and{' '}
                <strong>Neon PostgreSQL</strong>.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                >
                  <Briefcase className="h-4 w-4" /> View Projects <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 transition hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4" /> Contact
                </a>
                <div className="ml-1 flex items-center gap-2">
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-gray-900 ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-0">
              <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-indigo-500 to-orange-400 p-1 shadow-md ring-1 ring-black/5">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-white/90 text-4xl font-bold text-gray-800">
                  HK
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">About</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
          I enjoy transforming product ideas into reliable, readable code. My approach is simple:
          keep things type-safe, keep UI responsive, and keep the DX smooth for future changes. I
          value clean abstractions and practical testing over premature complexity.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-800 ring-1 ring-gray-200"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ===== Projects ===== */}
      <section id="projects" className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            See all
          </a>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          (Will be updated — below are placeholders to be replaced with real links and screenshots.)
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl bg-white p-5 ring-1 ring-gray-200 transition hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Code2 className="h-4 w-4" /> {p.name}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{p.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <a
                  href={p.href ?? '#'}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
                >
                  View project <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Experience (optional placeholder) ===== */}
      <section id="experience" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">Experience</h2>
        <ul className="mt-6 space-y-4">
          <li className="rounded-2xl bg-white p-5 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Briefcase className="h-4 w-4" /> Freelance Web Developer
              </div>
              <span className="text-xs text-gray-500">2024 — Present</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Building small apps and internal tools using Next.js, Tailwind, and Postgres. Focus on
              DX, performance, and maintainability.
            </p>
          </li>
        </ul>
      </section>

      {/* ===== Contact ===== */}
      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl bg-gray-900 p-8 text-white ring-1 ring-black/10">
          <h2 className="text-2xl font-semibold tracking-tight">Let’s build something together</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-300">
            I’m open to freelance and collaboration opportunities. Send me an email or connect via
            LinkedIn.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
            >
              <Mail className="h-4 w-4" /> hello@example.com
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/15"
            >
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
        <footer className="mt-8 pb-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} KukuIt. Built with Next.js & Tailwind.
        </footer>
      </section>
    </main>
  )
}
