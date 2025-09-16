"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema, type BuyerInput, cityEnum, propertyTypeEnum, bhkEnum, purposeEnum, timelineEnum, sourceEnum, statusEnum } from "@/lib/validation";
import { useRouter } from "next/navigation";

export default function BuyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [buyerId, setBuyerId] = useState<string>("");
  const form = useForm({ resolver: zodResolver(buyerSchema) });
  const propertyTypeWatch = form.watch("propertyType");

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setBuyerId(id);
      const res = await fetch(`/api/buyers/${id}`);
      const data = await res.json();
      if (res.ok) {
        const b = data.buyer;
        form.reset({
          fullName: b.fullName,
          email: b.email ?? undefined,
          phone: b.phone,
          city: b.city,
          propertyType: b.propertyType,
          bhk: b.bhk === "Studio" ? "Studio" : b.bhk ? (b.bhk === "One" ? "1" : b.bhk === "Two" ? "2" : b.bhk === "Three" ? "3" : b.bhk === "Four" ? "4" : undefined) : undefined,
          purpose: b.purpose,
          budgetMin: b.budgetMin ?? undefined,
          budgetMax: b.budgetMax ?? undefined,
          timeline: b.timeline === "T0_3m" ? "0-3m" : b.timeline === "T3_6m" ? "3-6m" : b.timeline === "GT6m" ? ">6m" : "Exploring",
          source: b.source === "Walk_in" ? "Walk-in" : b.source,
          notes: b.notes ?? undefined,
          tags: (b.tags ?? []) as string[],
          status: b.status,
        });
        setUpdatedAt(b.updatedAt);
        setHistory(data.history ?? []);
      } else alert("Failed to load");
      setLoading(false);
    })();
  }, [params]);

  async function onSubmit(values: BuyerInput) {
    const res = await fetch(`/api/buyers/${buyerId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, updatedAt }) });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error?.message ?? data.error ?? "Failed to update");
      if (res.status === 409) router.refresh();
      return;
    }
    router.refresh();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">View / Edit Lead</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name" error={form.formState.errors.fullName?.message}><input {...form.register("fullName")} className="input" /></Field>
        <Field label="Email" error={form.formState.errors.email?.message}><input type="email" {...form.register("email")} className="input" /></Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}><input {...form.register("phone")} className="input" /></Field>
        <Field label="City" error={form.formState.errors.city?.message}><Select name="city" register={form.register} options={cityEnum.options} /></Field>
        <Field label="Property Type" error={form.formState.errors.propertyType?.message}><Select name="propertyType" register={form.register} options={propertyTypeEnum.options} /></Field>
        {(propertyTypeWatch === "Apartment" || propertyTypeWatch === "Villa") && (
          <Field label="BHK" error={form.formState.errors.bhk?.message}><Select name="bhk" register={form.register} options={bhkEnum.options} /></Field>
        )}
        <Field label="Purpose" error={form.formState.errors.purpose?.message}><Select name="purpose" register={form.register} options={purposeEnum.options} /></Field>
        <Field label="Budget Min (INR)" error={form.formState.errors.budgetMin?.message}><input type="number" {...form.register("budgetMin", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Budget Max (INR)" error={form.formState.errors.budgetMax?.message}><input type="number" {...form.register("budgetMax", { valueAsNumber: true })} className="input" /></Field>
        <Field label="Timeline" error={form.formState.errors.timeline?.message}><Select name="timeline" register={form.register} options={timelineEnum.options} /></Field>
        <Field label="Source" error={form.formState.errors.source?.message}><Select name="source" register={form.register} options={sourceEnum.options} /></Field>
        <div className="md:col-span-2"><Field label="Notes" error={form.formState.errors.notes?.message}><textarea rows={4} {...form.register("notes")} className="w-full border rounded px-3 py-2" /></Field></div>
        <div className="md:col-span-2"><Field label="Tags (comma separated)"><input className="input" onChange={(e)=>{const parts=e.target.value.split(",").map(s=>s.trim()).filter(Boolean); (form.setValue as any)("tags", parts);}} /></Field></div>
        <div className="md:col-span-2"><Field label="Status" error={form.formState.errors.status?.message}><Select name="status" register={form.register} options={statusEnum.options} /></Field></div>
        <div className="md:col-span-2"><button type="submit" className="bg-black text-white rounded px-4 py-2">Save</button></div>
      </form>

      <div className="mt-8">
        <h2 className="font-semibold mb-2">Recent Changes</h2>
        <ul className="space-y-2">
          {history.map((h) => (
            <li key={h.id} className="text-sm border rounded p-2">
              <span className="opacity-70 mr-2">{new Date(h.changedAt).toLocaleString()}</span>
              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(h.diff, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <div role="alert" className="text-red-600 text-sm mt-1">{error}</div>}
    </label>
  );
}

function Select({ name, register, options }: { name: keyof BuyerInput & string; register: any; options: string[] }) {
  return (
    <select {...register(name)} className="input">
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}


