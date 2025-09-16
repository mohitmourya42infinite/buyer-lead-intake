import { describe, it, expect } from "vitest";
import { buyerSchema } from "@/lib/validation";

describe("buyerSchema", () => {
  it("fails when budgetMax < budgetMin", () => {
    const res = buyerSchema.safeParse({
      fullName: "John Doe",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "1",
      purpose: "Buy",
      budgetMin: 200,
      budgetMax: 100,
      timeline: "0-3m",
      source: "Website",
      status: "New",
    });
    expect(res.success).toBe(false);
  });
});


