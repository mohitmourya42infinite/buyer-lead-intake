import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buyerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const key = `${session.user.id}:${ip}:create`;
  const rl = rateLimit(key, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Rate limit", retryAfterMs: rl.retryAfterMs }, { status: 429 });

  const json = await req.json();
  const parsed = buyerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.findUnique({ where: { id: session.user!.id as string } });
    if (!owner) throw new Error("Owner not found");
    const buyer = await tx.buyer.create({
      data: {
        fullName: data.fullName,
        email: data.email ?? null,
        phone: data.phone,
        city: data.city as any,
        propertyType: data.propertyType as any,
        bhk: (data.bhk ? (data.bhk === "Studio" ? "Studio" : ({ "1": "One", "2": "Two", "3": "Three", "4": "Four" } as const)[data.bhk]) : null) as any,
        purpose: data.purpose as any,
        budgetMin: data.budgetMin ?? null,
        budgetMax: data.budgetMax ?? null,
        timeline: (data.timeline === "0-3m" ? "T0_3m" : data.timeline === "3-6m" ? "T3_6m" : data.timeline === ">6m" ? "GT6m" : "Exploring") as any,
        source: (data.source === "Walk-in" ? "Walk_in" : data.source) as any,
        notes: data.notes ?? null,
        tags: data.tags ?? null,
        status: data.status as any,
        ownerId: session.user!.id as string,
      },
    });
    await tx.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: session.user!.id as string,
        diff: { created: true, fields: buyer },
      },
    });
    return buyer;
  });

  return NextResponse.json({ buyer: created });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 10;
  const q = (searchParams.get("q") ?? "").trim();
  const city = searchParams.get("city") ?? undefined;
  const propertyType = searchParams.get("propertyType") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const timeline = searchParams.get("timeline") ?? undefined;

  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  const [total, items] = await Promise.all([
    prisma.buyer.count({ where }),
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        fullName: true,
        phone: true,
        city: true,
        propertyType: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, items });
}


