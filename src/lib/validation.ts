import { z } from "zod";

export const cityEnum = z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]);
export const propertyTypeEnum = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
export const bhkEnum = z.enum(["1", "2", "3", "4", "Studio"]);
export const purposeEnum = z.enum(["Buy", "Rent"]);
export const timelineEnum = z.enum(["0-3m", "3-6m", ">6m", "Exploring"]);
export const sourceEnum = z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]);
export const statusEnum = z.enum(["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"]);

export const buyerBaseSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().regex(/^\d{10,15}$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional(),
  purpose: purposeEnum,
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  status: statusEnum.default("New"),
});

export const buyerSchema = buyerBaseSchema.superRefine((val, ctx) => {
  if ((val.propertyType === "Apartment" || val.propertyType === "Villa") && !val.bhk) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "BHK is required for Apartment/Villa", path: ["bhk"] });
  }
  if (val.budgetMin !== undefined && val.budgetMax !== undefined && val.budgetMax < val.budgetMin) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Max budget must be ≥ Min budget", path: ["budgetMax"] });
  }
});

export type BuyerInput = z.infer<typeof buyerSchema>;


