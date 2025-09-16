"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buyerSchema, type BuyerInput, cityEnum, propertyTypeEnum, bhkEnum, purposeEnum, timelineEnum, sourceEnum, statusEnum } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBuyerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<BuyerInput>({ resolver: zodResolver(buyerSchema), defaultValues: { status: "New" } });
  const propertyTypeWatch = form.watch("propertyType");

  async function onSubmit(values: BuyerInput) {
    setSubmitting(true);
    const res = await fetch("/api/buyers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      const message = data?.error?.formErrors?.join("\n") ?? "Failed to create";
      alert(message);
      return;
    }
    router.push("/buyers");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Lead</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite">
        <Field label="Full Name" error={form.formState.errors.fullName?.message}>
          <input {...form.register("fullName")} className="input" />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input type="email" {...form.register("email")} className="input" />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <input {...form.register("phone")} className="input" />
        </Field>
        <Field label="City" error={form.formState.errors.city?.message}>
          <Select name="city" register={form.register} options={cityEnum.options} />
        </Field>
        <Field label="Property Type" error={form.formState.errors.propertyType?.message}>
          <Select name="propertyType" register={form.register} options={propertyTypeEnum.options} />
        </Field>
        {(propertyTypeWatch === "Apartment" || propertyTypeWatch === "Villa") && (
          <Field label="BHK" error={form.formState.errors.bhk?.message}>
            <Select name="bhk" register={form.register} options={bhkEnum.options} />
          </Field>
        )}
        <Field label="Purpose" error={form.formState.errors.purpose?.message}>
          <Select name="purpose" register={form.register} options={purposeEnum.options} />
        </Field>
        <Field label="Budget Min (INR)" error={form.formState.errors.budgetMin?.message}>
          <input type="number" {...form.register("budgetMin", { valueAsNumber: true })} className="input" />
        </Field>
        <Field label="Budget Max (INR)" error={form.formState.errors.budgetMax?.message}>
          <input type="number" {...form.register("budgetMax", { valueAsNumber: true })} className="input" />
        </Field>
        <Field label="Timeline" error={form.formState.errors.timeline?.message}>
          <Select name="timeline" register={form.register} options={timelineEnum.options} />
        </Field>
        <Field label="Source" error={form.formState.errors.source?.message}>
          <Select name="source" register={form.register} options={sourceEnum.options} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notes" error={form.formState.errors.notes?.message}>
            <textarea rows={4} {...form.register("notes")} className="w-full border rounded px-3 py-2" />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Tags (comma separated)" error={form.formState.errors.tags?.message as any}>
            <input
              className="input"
              onChange={(e) => {
                const parts = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                form.setValue("tags", parts);
              }}
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Status" error={form.formState.errors.status?.message}>
            <Select name="status" register={form.register} options={statusEnum.options} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="bg-black text-white rounded px-4 py-2">
            {submitting ? "Submitting..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error && (
        <div role="alert" className="text-red-600 text-sm mt-1">
          {error}
        </div>
      )}
    </label>
  );
}

function Select({ name, register, options }: { name: keyof BuyerInput & string; register: any; options: string[] }) {
  return (
    <select {...register(name)} className="input">
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}


