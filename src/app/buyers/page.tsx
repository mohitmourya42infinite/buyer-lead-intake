import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { cookies } from "next/headers";

async function fetchBuyers(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string" && v) params.set(k, v);
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const url = `${base}/api/buyers${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) throw new Error("Failed to load buyers");
  return res.json();
}

export default async function BuyersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { items, total, page, pageSize } = await fetchBuyers(sp);
  const qp = new URLSearchParams(sp as Record<string, string>);
  const currentPage = Math.max(1, Number(qp.get("page") ?? 1));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Buyers</h1>
        <Link href="/buyers/new" className="bg-black text-white rounded px-3 py-2">New</Link>
      </div>
      {items.length === 0 ? (
        <EmptyState />
      ) : (
      <>
      <form className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2" action="/buyers">
        <input name="q" placeholder="Search name/phone/email" className="input" defaultValue={qp.get("q") ?? ""} />
        <select name="city" className="input" defaultValue={qp.get("city") ?? ""}>
          <option value="">City</option>
          {['Chandigarh','Mohali','Zirakpur','Panchkula','Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="propertyType" className="input" defaultValue={qp.get("propertyType") ?? ""}>
          <option value="">Property</option>
          {['Apartment','Villa','Plot','Office','Retail'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="status" className="input" defaultValue={qp.get("status") ?? ""}>
          <option value="">Status</option>
          {['New','Qualified','Contacted','Visited','Negotiation','Converted','Dropped'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="timeline" className="input" defaultValue={qp.get("timeline") ?? ""}>
          <option value="">Timeline</option>
          {["0-3m","3-6m",">6m","Exploring"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="bg-gray-900 text-white rounded px-3 py-2">Apply</button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>City</Th>
              <Th>PropertyType</Th>
              <Th>Budget</Th>
              <Th>Timeline</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((b: any) => (
              <tr key={b.id} className="border-t">
                <Td>{b.fullName}</Td>
                <Td>{b.phone}</Td>
                <Td>{b.city}</Td>
                <Td>{b.propertyType}</Td>
                <Td>{b.budgetMin ?? "-"} – {b.budgetMax ?? "-"}</Td>
                <Td>{b.timeline}</Td>
                <Td>{b.status}</Td>
                <Td>{new Date(b.updatedAt).toLocaleString()}</Td>
                <Td>
                  <Link href={`/buyers/${b.id}`} className="underline">View</Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 items-center mt-4">
        <PaginationLink disabled={currentPage<=1} href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(qp), page: String(currentPage-1) }).toString()}`}>Prev</PaginationLink>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <PaginationLink disabled={currentPage>=totalPages} href={`/buyers?${new URLSearchParams({ ...Object.fromEntries(qp), page: String(currentPage+1) }).toString()}`}>Next</PaginationLink>
      </div>
      </>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left px-3 py-2 border-b">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="px-3 py-2">{children}</td>; }
function PaginationLink({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="px-3 py-2 text-gray-400">{children}</span>;
  return <Link href={href} className="px-3 py-2 underline">{children}</Link>;
}


