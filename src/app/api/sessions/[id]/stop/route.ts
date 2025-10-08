import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const existing = await prisma.workSession.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (existing.endAt) {
    return NextResponse.json({ error: "Session already stopped" }, { status: 400 });
  }

  const endAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.floor((endAt.getTime() - new Date(existing.startAt).getTime()) / 1000)
  );

  const updated = await prisma.workSession.update({
    where: { id },
    data: { endAt, durationSeconds },
  });

  return NextResponse.json(updated);
}
