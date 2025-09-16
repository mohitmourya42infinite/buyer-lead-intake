import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buyerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const buyer = await prisma.buyer.findUnique({ where: { id: params.id } });
  if (!buyer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const history = await prisma.buyerHistory.findMany({ where: { buyerId: params.id }, orderBy: { changedAt: "desc" }, take: 5 });
  return NextResponse.json({ buyer, history });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const { updatedAt, ...rest } = json ?? {};
  if (!updatedAt) return NextResponse.json({ error: "Missing updatedAt" }, { status: 400 });
  const parsed = buyerSchema.safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const key = `${session.user.id}:${ip}:update`;
  const rl = rateLimit(key, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit", retryAfterMs: rl.retryAfterMs }, { status: 429 });

  const existing = await prisma.buyer.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.ownerId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (new Date(updatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
    return NextResponse.json({ error: "Record changed, please refresh" }, { status: 409 });
  }

  const mapped: any = {
    fullName: data.fullName,
    email: data.email ?? null,
    phone: data.phone,
    city: data.city,
    propertyType: data.propertyType,
    bhk: (data.bhk ? (data.bhk === "Studio" ? "Studio" : ({ "1": "One", "2": "Two", "3": "Three", "4": "Four" } as const)[data.bhk]) : null),
    purpose: data.purpose,
    budgetMin: data.budgetMin ?? null,
    budgetMax: data.budgetMax ?? null,
    timeline: (data.timeline === "0-3m" ? "T0_3m" : data.timeline === "3-6m" ? "T3_6m" : data.timeline === ">6m" ? "GT6m" : "Exploring"),
    source: (data.source === "Walk-in" ? "Walk_in" : data.source),
    notes: data.notes ?? null,
    tags: data.tags ?? null,
    status: data.status,
  };

  const updated = await prisma.$transaction(async (tx) => {
    const buyer = await tx.buyer.update({ where: { id: params.id }, data: mapped });
    const diff: Record<string, any> = {};
    for (const k of Object.keys(mapped)) {
      if ((existing as any)[k] !== (buyer as any)[k]) diff[k] = { from: (existing as any)[k], to: (buyer as any)[k] };
    }
    await tx.buyerHistory.create({ data: { buyerId: buyer.id, changedBy: session.user!.id as string, diff } });
    return buyer;
  });

  return NextResponse.json({ buyer: updated });
}


