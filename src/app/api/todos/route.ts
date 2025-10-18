import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status, TodoPriority, TodoState, TodoCategory } from '@prisma/client'

export const revalidate = 0
export const dynamic = 'force-dynamic'

// yyyy-mm-dd -> Date at 00:00 & 23:59:59.999 (đơn giản, tránh rắc rối timezone)
function toStartOfDay(d: string) {
  return new Date(`${d}T00:00:00.000Z`)
}
function toEndOfDay(d: string) {
  return new Date(`${d}T23:59:59.999Z`)
}

// Helpers parse an toàn enum
function parseEnum<T extends string>(val: any, allowed: readonly T[]): T | undefined {
  return allowed.includes(val) ? (val as T) : undefined
}

// GET /api/todos
// Query:
//   status=active|disabled|all
//   state=todo|in_progress|waiting|blocked|done|canceled|archived
//   category=Ainka|Kuku|Freelancer|Personal|Learning|Other
//   priority=low|normal|high|urgent|critical
//   parentId=string (lọc theo task con của 1 cha cụ thể; parentId=__root__ để lấy task root)
//   q=keyword (search title/description/labels)
//   dueFrom=YYYY-MM-DD & dueTo=YYYY-MM-DD
//   skip=0&take=50
//   order=dueAt|createdAt|updatedAt  dir=asc|desc
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const statusParam = (searchParams.get('status') || 'active').toLowerCase()
    const isAll = statusParam === 'all'
    const statusFilter =
      statusParam === 'active' || statusParam === 'disabled' ? (statusParam as Status) : 'active'

    const stateParam = searchParams.get('state') as TodoState | null
    const state = parseEnum<TodoState>(stateParam, [
      'todo',
      'in_progress',
      'waiting',
      'blocked',
      'done',
      'canceled',
      'archived',
    ] as const)

    const categoryParam = searchParams.get('category') as TodoCategory | null
    const category = parseEnum<TodoCategory>(categoryParam, [
      'Ainka',
      'Kuku',
      'Freelancer',
      'Personal',
      'Learning',
      'Other',
    ] as const)

    const priorityParam = searchParams.get('priority') as TodoPriority | null
    const priority = parseEnum<TodoPriority>(priorityParam, [
      'low',
      'normal',
      'high',
      'urgent',
      'critical',
    ] as const)

    const parentIdParam = searchParams.get('parentId')
    const q = (searchParams.get('q') || '').trim()

    const dueFrom = searchParams.get('dueFrom') || ''
    const dueTo = searchParams.get('dueTo') || ''

    const skipParam = searchParams.get('skip')
    const takeParam = searchParams.get('take')
    const skip = skipParam != null ? Math.max(parseInt(skipParam, 10) || 0, 0) : 0
    const take = takeParam != null ? Math.min(Math.max(parseInt(takeParam, 10) || 0, 1), 200) : 100

    const orderField = (searchParams.get('order') || 'dueAt') as 'dueAt' | 'createdAt' | 'updatedAt'
    const orderDir = (searchParams.get('dir') || 'asc') as 'asc' | 'desc'

    // parentId filter:
    // - nếu parentId="__root__": lấy các task root (parentId null)
    // - nếu parentId=<id>: lấy task con của id đó
    // - nếu không truyền: không lọc (lấy tất cả)
    const parentFilter =
      parentIdParam === '__root__'
        ? { parentId: null }
        : parentIdParam
          ? { parentId: parentIdParam }
          : {}

    const where: any = {
      ...(isAll ? {} : { status: statusFilter }),
      ...(state ? { state } : {}),
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
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
      status: isAll ? 'all' : statusFilter,
      state: state ?? null,
      category: category ?? null,
      priority: priority ?? null,
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
