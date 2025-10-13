import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export const revalidate = 0
export const dynamic = 'force-dynamic'

// YYYY-MM-DD theo Asia/Ho_Chi_Minh
function toVNDateStr(date = new Date()) {
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  const y = tzDate.getFullYear()
  const m = String(tzDate.getMonth() + 1).padStart(2, '0')
  const d = String(tzDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// GET /api/healthlog?date=YYYY-MM-DD&status=active|disabled|all&from=YYYY-MM-DD&to=YYYY-MM-DD&skip=0&take=50
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || '' // nếu có -> lọc đúng ngày
    const from = searchParams.get('from') || '' // hoặc lọc theo khoảng
    const to = searchParams.get('to') || ''

    const statusParam = (searchParams.get('status') || 'active').toLowerCase()
    const isAll = statusParam === 'all'
    const statusFilter =
      statusParam === 'active' || statusParam === 'disabled' ? (statusParam as Status) : 'active'

    // ✅ Parse skip/take an toàn
    const skipParam = searchParams.get('skip')
    const takeParam = searchParams.get('take')
    const skip = skipParam != null ? Math.max(parseInt(skipParam, 10) || 0, 0) : 0
    const take = takeParam != null ? Math.min(Math.max(parseInt(takeParam, 10) || 0, 1), 200) : 100

    const where: any = {
      ...(isAll ? {} : { status: statusFilter }),
      ...(date ? { date } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.healthLog.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.healthLog.count({ where }),
    ])

    return NextResponse.json({
      status: isAll ? 'all' : statusFilter,
      date,
      from,
      to,
      skip,
      take,
      total,
      items,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/healthlog
// Body JSON: { date?:string, weekday?, weight?, morning?, gym?, afternoon?, noEatAfter?, calories?, goutTreatment?, status? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const data = {
      date: (body.date as string) || toVNDateStr(),
      weekday: body.weekday ?? null, // (có thể auto-fill sau)
      weight: body.weight != null ? String(body.weight) : null, // Prisma Decimal nhận string
      morning: body.morning ?? null,
      gym: body.gym ?? null,
      afternoon: body.afternoon ?? null,
      noEatAfter: body.noEatAfter ?? null,
      calories: body.calories != null ? Number(body.calories) : null,
      goutTreatment: body.goutTreatment != null ? Number(body.goutTreatment) : null,
      status: body.status === 'disabled' ? Status.disabled : Status.active,
    }

    const created = await prisma.healthLog.create({ data })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cannot create' }, { status: 500 })
  }
}
