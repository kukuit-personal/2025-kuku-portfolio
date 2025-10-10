import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkSessionStatus } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const existing = await prisma.workSession.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (existing.status === WorkSessionStatus.disabled) {
    return NextResponse.json({ error: "Session already disabled" }, { status: 400 });
  }

  const updated = await prisma.workSession.update({
    where: { id },
    data: { status: WorkSessionStatus.disabled },
  });

  return NextResponse.json(updated, { status: 200 });
}
