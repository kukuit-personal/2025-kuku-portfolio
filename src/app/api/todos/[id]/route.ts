import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status, TodoPriority, TodoState, TodoCategory } from '@prisma/client'

type Params = { params: { id: string } }

function parseEnum<T extends string>(val: any, allowed: readonly T[]): T | undefined {
  return allowed.includes(val) ? (val as T) : undefined
}

// PUT /api/todos/:id  (partial update)
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = params
    const body = await req.json().catch(() => ({}))

    const data: any = {}

    if (body.title != null) data.title = String(body.title).trim()
    if (body.description != null) data.description = body.description ?? null

    if (body.labels != null) {
      if (Array.isArray(body.labels)) {
        data.labels = body.labels.map((s: any) => String(s)).filter(Boolean)
      } else if (typeof body.labels === 'string') {
        data.labels = body.labels
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      } else {
        data.labels = []
      }
    }

    const category = parseEnum<TodoCategory>(body.category, [
      'Ainka',
      'Kuku',
      'Freelancer',
      'Personal',
      'Learning',
      'Other',
    ] as const)
    if (category) data.category = category

    const priority = parseEnum<TodoPriority>(body.priority, [
      'low',
      'normal',
      'high',
      'urgent',
      'critical',
    ] as const)
    if (priority) data.priority = priority

    const state = parseEnum<TodoState>(body.state, [
      'todo',
      'in_progress',
      'waiting',
      'blocked',
      'done',
      'canceled',
      'archived',
    ] as const)
    if (state) data.state = state

    if (body.dueAt !== undefined) data.dueAt = body.dueAt ? new Date(String(body.dueAt)) : null
    if (body.startedAt !== undefined)
      data.startedAt = body.startedAt ? new Date(String(body.startedAt)) : null
    if (body.completedAt !== undefined)
      data.completedAt = body.completedAt ? new Date(String(body.completedAt)) : null
    if (body.canceledAt !== undefined)
      data.canceledAt = body.canceledAt ? new Date(String(body.canceledAt)) : null

    if (body.estimateMin !== undefined)
      data.estimateMin = body.estimateMin != null ? Number(body.estimateMin) : null
    if (body.spentMin !== undefined)
      data.spentMin = body.spentMin != null ? Number(body.spentMin) : null
    if (body.waitingOn !== undefined) data.waitingOn = body.waitingOn ?? null

    if (body.parentId !== undefined) data.parentId = body.parentId ?? null
    if (body.sortOrder !== undefined)
      data.sortOrder = body.sortOrder != null ? Number(body.sortOrder) : null

    if (body.status === 'active' || body.status === 'disabled') data.status = body.status as Status

    const updated = await prisma.todo.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cannot update' }, { status: 500 })
  }
}

// DELETE /api/todos/:id  (soft delete -> status=disabled)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params
    const updated = await prisma.todo.update({
      where: { id },
      data: { status: Status.disabled },
    })
    return NextResponse.json({ ok: true, id: updated.id, status: updated.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cannot delete' }, { status: 500 })
  }
}
