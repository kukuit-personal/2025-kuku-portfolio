import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// YYYY-MM-DD theo Asia/Ho_Chi_Minh
function toVNDateStr(date = new Date()) {
  const tzDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const y = tzDate.getFullYear();
  const m = String(tzDate.getMonth() + 1).padStart(2, "0");
  const d = String(tzDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// GET /api/sessions?date=YYYY-MM-DD&status=active|disabled|all
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || toVNDateStr();
  const statusParam = (searchParams.get("status") || "active").toLowerCase();

  // Hỗ trợ 3 mode: active (default), disabled, all
  const isAll = statusParam === "all";
  const statusFilter =
    statusParam === "active" || statusParam === "disabled"
      ? statusParam
      : "active"; // fallback an toàn

  const sessions = await prisma.workSession.findMany({
    where: {
      date,
      ...(isAll ? {} : { status: statusFilter as any }), // nếu enum: as WorkSessionStatus
    },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json({ date, status: isAll ? "all" : statusFilter, sessions });
}

// POST /api/sessions  (start)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const device = body?.device as string | undefined;
  const notes = body?.notes as string | undefined;
  const payloadDate = (body?.date as string | undefined) || toVNDateStr();
  const now = new Date();

  const created = await prisma.workSession.create({
    data: {
      date: payloadDate,
      startAt: now,
      device,
      notes,
      // status: 'active', // không cần nếu đã set default trong Prisma
    },
  });

  return NextResponse.json(created, { status: 201 });
}
