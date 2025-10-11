import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

type Params = { params: { id: string } };

// PUT /api/healthlog/:id
// Body JSON: các field giống POST (partial update)
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));

    const data: any = {};
    if (body.date != null) data.date = String(body.date);
    if (body.weekday != null) data.weekday = body.weekday ?? null;
    if (body.weight != null) data.weight = String(body.weight); // Decimal => string
    if (body.morning != null) data.morning = body.morning ?? null;
    if (body.gym != null) data.gym = body.gym ?? null;
    if (body.afternoon != null) data.afternoon = body.afternoon ?? null;
    if (body.noEatAfter != null) data.noEatAfter = body.noEatAfter ?? null;
    if (body.calories != null) data.calories = Number(body.calories);
    if (body.goutTreatment != null) data.goutTreatment = Number(body.goutTreatment);
    if (body.status === "active" || body.status === "disabled")
      data.status = body.status as Status;

    const updated = await prisma.healthLog.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cannot update" }, { status: 500 });
  }
}

// DELETE /api/healthlog/:id
// Soft delete: set status='disabled'
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = params;
    const updated = await prisma.healthLog.update({
      where: { id },
      data: { status: Status.disabled },
    });
    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cannot delete" }, { status: 500 });
  }
}
