import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status, TodoPriority, TodoState, TodoCategory } from '@prisma/client'

export const revalidate = 0
export const dynamic = 'force-dynamic'

// yyyy-mm-dd -> Date at 00:00 & 23:59:59.999 (UTC)
function toStartOfDay(d: string) {
  return new Date(`${d}T00:00:00.000Z`)
}
function toEndOfDay(d: string) {
  return new Date(`${d}T23:59:59.999Z`)
}

// Helpers
function parseEnum<T extends string>(val: any, allowed: readonly T[]): T | undefined {
  return allowed.includes(val) ? (val as T) : undefined
}
function parseCSVEnum<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  {
    treatAllAsNoFilter = true, // "all" => không filter
  }: { treatAllAsNoFilter?: boolean } = {}
): T[] {
  if (!raw || !raw.trim()) return []
  if (treatAllAsNoFilter && raw === 'all') return []
  const arr = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as T[]
  return arr.filter((x) => (allowed as readonly string[]).includes(x))
}

// GET /api/todos
// Query supports CSV:
//   state=todo,in_progress
//   category=Ainka,Personal  | category=all
//   priority=high,urgent     | priority=all
// Other params keep nguyên behavior.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // status
    const statusParam = (searchParams.get('status') || 'active').toLowerCase()
    const isAllStatus = statusParam === 'all'
    const statusFilter: Status =
      statusParam === 'active' || statusParam === 'disabled'
        ? (statusParam as Status)
        : Status.active

    // MULTI filters (CSV)
    const states = parseCSVEnum<TodoState>(searchParams.get('state'), [
      'todo',
      'in_progress',
      'waiting',
      'blocked',
      'done',
      'canceled',
      'archived',
    ] as const)

    const categories = parseCSVEnum<TodoCategory>(searchParams.get('category'), [
      'Ainka',
      'Kuku',
      'Freelancer',
      'Personal',
      'Learning',
      'Other',
    ] as const)

    const priorities = parseCSVEnum<TodoPriority>(searchParams.get('priority'), [
      'low',
      'normal',
      'high',
      'urgent',
      'critical',
    ] as const)

    // Parent filter
    const parentIdParam = searchParams.get('parentId')
    const parentFilter =
      parentIdParam === '__root__'
        ? { parentId: null }
        : parentIdParam
          ? { parentId: parentIdParam }
          : {}

    // Search + due range
    const q = (searchParams.get('q') || '').trim()
    const dueFrom = searchParams.get('dueFrom') || ''
    const dueTo = searchParams.get('dueTo') || ''

    // Paging + sort
    const skipParam = searchParams.get('skip')
    const takeParam = searchParams.get('take')
    const skip = skipParam != null ? Math.max(parseInt(skipParam, 10) || 0, 0) : 0
    const take = takeParam != null ? Math.min(Math.max(parseInt(takeParam, 10) || 0, 1), 200) : 100

    const orderField = (searchParams.get('order') || 'dueAt') as 'dueAt' | 'createdAt' | 'updatedAt'
    const orderDir = (searchParams.get('dir') || 'asc') as 'asc' | 'desc'

    // WHERE
    const where: any = {
      ...(isAllStatus ? {} : { status: statusFilter }),
      ...(states.length ? { state: { in: states } } : {}),
      ...(categories.length ? { category: { in: categories } } : {}),
      ...(priorities.length ? { priority: { in: priorities } } : {}),
      ...parentFilter,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { labels: { has: q } },
            ],
          }
        : {}),
      ...(dueFrom || dueTo
        ? {
            dueAt: {
              ...(dueFrom ? { gte: toStartOfDay(dueFrom) } : {}),
              ...(dueTo ? { lte: toEndOfDay(dueTo) } : {}),
            },
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: [{ [orderField]: orderDir }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.todo.count({ where }),
    ])

    return NextResponse.json({
      status: isAllStatus ? 'all' : statusFilter,
      states,
      categories: categories.length ? categories : 'all',
      priorities: priorities.length ? priorities : 'all',
      parentId: parentIdParam ?? null,
      q,
      dueFrom,
      dueTo,
      skip,
      take,
      total,
      items,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/todos
// Body JSON: { title: string, description?, labels?: string[] | string, category?, priority?, state?, dueAt?, startedAt?, completedAt?, canceledAt?, estimateMin?, spentMin?, waitingOn?, parentId?, sortOrder?, status? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // labels: có thể gửi chuỗi "a,b,c" hoặc mảng
    let labels: string[] | null = null
    if (Array.isArray(body.labels)) {
      labels = body.labels.map((s: any) => String(s)).filter(Boolean)
    } else if (typeof body.labels === 'string') {
      labels = body.labels
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
    }

    const data = {
      title: String(body.title ?? '').trim(),
      description: body.description ?? null,
      labels: labels ?? [],
      category:
        parseEnum<TodoCategory>(body.category, [
          'Ainka',
          'Kuku',
          'Freelancer',
          'Personal',
          'Learning',
          'Other',
        ] as const) ?? TodoCategory.Other,
      priority:
        parseEnum<TodoPriority>(body.priority, [
          'low',
          'normal',
          'high',
          'urgent',
          'critical',
        ] as const) ?? TodoPriority.normal,
      state:
        parseEnum<TodoState>(body.state, [
          'todo',
          'in_progress',
          'waiting',
          'blocked',
          'done',
          'canceled',
          'archived',
        ] as const) ?? TodoState.todo,

      dueAt: body.dueAt ? new Date(String(body.dueAt)) : null,
      startedAt: body.startedAt ? new Date(String(body.startedAt)) : null,
      completedAt: body.completedAt ? new Date(String(body.completedAt)) : null,
      canceledAt: body.canceledAt ? new Date(String(body.canceledAt)) : null,

      estimateMin: body.estimateMin != null ? Number(body.estimateMin) : null,
      spentMin: body.spentMin != null ? Number(body.spentMin) : null,
      waitingOn: body.waitingOn ?? null,

      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : null,

      status: body.status === 'disabled' ? Status.disabled : Status.active,
    }

    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const created = await prisma.todo.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cannot create' }, { status: 500 })
  }
}
