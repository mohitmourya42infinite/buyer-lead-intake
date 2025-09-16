import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { buyerSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const text = await req.text();
  const records = parse(text, { columns: true, skip_empty_lines: true, trim: true });
  if (records.length > 200) return NextResponse.json({ error: "Max 200 rows" }, { status: 400 });

  const valid: any[] = [];
  const errors: { row: number; message: string }[] = [];
  const headers = ["fullName","email","phone","city","propertyType","bhk","purpose","budgetMin","budgetMax","timeline","source","notes","tags","status"];
  // quick header check
  const first = Object.keys(records[0] ?? {});
  const missing = headers.filter(h => !first.includes(h));
  if (missing.length) return NextResponse.json({ error: `Missing headers: ${missing.join(', ')}` }, { status: 400 });

  for (let i = 0; i < records.length; i++) {
    const r = records[i] as any;
    const mapped = {
      fullName: r.fullName,
      email: r.email || undefined,
      phone: r.phone,
      city: r.city,
      propertyType: r.propertyType,
      bhk: r.bhk || undefined,
      purpose: r.purpose,
      budgetMin: r.budgetMin ? Number(r.budgetMin) : undefined,
      budgetMax: r.budgetMax ? Number(r.budgetMax) : undefined,
      timeline: r.timeline,
      source: r.source,
      notes: r.notes || undefined,
      tags: r.tags ? String(r.tags).split('|').map((s:string)=>s.trim()).filter(Boolean) : undefined,
      status: r.status || "New",
    };
    const parsed = buyerSchema.safeParse(mapped);
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') });
    } else {
      valid.push(parsed.data);
    }
  }

  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    for (const data of valid) {
      await tx.buyer.create({
        data: {
          fullName: data.fullName,
          email: data.email ?? null,
          phone: data.phone,
          city: data.city as any,
          propertyType: data.propertyType as any,
          bhk: (data.bhk ? (data.bhk === "Studio" ? "Studio" : (data.bhk === "1" ? "One" : data.bhk === "2" ? "Two" : data.bhk === "3" ? "Three" : data.bhk === "4" ? "Four" : null)) : null) as any,
          purpose: data.purpose as any,
          budgetMin: data.budgetMin ?? null,
          budgetMax: data.budgetMax ?? null,
          timeline: (data.timeline === "0-3m" ? "T0_3m" : data.timeline === "3-6m" ? "T3_6m" : data.timeline === ">6m" ? "GT6m" : "Exploring") as any,
          source: (data.source === "Walk-in" ? "Walk_in" : data.source) as any,
          notes: data.notes ?? null,
          tags: data.tags ?? undefined,
          status: data.status as any,
          ownerId: "import", // for demo; real app should use session
        },
      });
    }
  });

  return NextResponse.json({ inserted: valid.length });
}


