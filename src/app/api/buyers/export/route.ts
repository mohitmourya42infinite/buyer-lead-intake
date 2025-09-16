import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const city = searchParams.get("city") ?? undefined;
  const propertyType = searchParams.get("propertyType") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const timeline = searchParams.get("timeline") ?? undefined;

  const where: any = {};
  if (q) where.OR = [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }];
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  const buyers = await prisma.buyer.findMany({ where, orderBy: { updatedAt: "desc" } });

  const headers = ["fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"];
  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const b of buyers) {
    const row = [
      b.fullName,
      b.email ?? "",
      b.phone,
      b.city,
      b.propertyType,
      b.bhk === "Studio" ? "Studio" : b.bhk ? (b.bhk === "One" ? "1" : b.bhk === "Two" ? "2" : b.bhk === "Three" ? "3" : b.bhk === "Four" ? "4" : "") : "",
      b.purpose,
      b.budgetMin?.toString() ?? "",
      b.budgetMax?.toString() ?? "",
      b.timeline === "T0_3m" ? "0-3m" : b.timeline === "T3_6m" ? "3-6m" : b.timeline === "GT6m" ? ">6m" : "Exploring",
      b.source === "Walk_in" ? "Walk-in" : b.source,
      (b.notes ?? "").replace(/\n/g, " ").replace(/"/g, '""'),
      Array.isArray(b.tags) ? (b.tags as string[]).join("|") : "",
      b.status,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    lines.push(row);
  }
  const csv = lines.join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=buyers.csv" } });
}


