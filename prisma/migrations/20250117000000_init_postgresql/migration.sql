-- CreateEnum
CREATE TYPE "City" AS ENUM ('Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Apartment', 'Villa', 'Plot', 'Office', 'Retail');

-- CreateEnum
CREATE TYPE "BHK" AS ENUM ('One', 'Two', 'Three', 'Four', 'Studio');

-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('Buy', 'Rent');

-- CreateEnum
CREATE TYPE "Timeline" AS ENUM ('T0_3m', 'T3_6m', 'GT6m', 'Exploring');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('Website', 'Referral', 'Walk_in', 'Call', 'Other');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "bhk" "BHK",
    "purpose" "Purpose" NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" "Timeline" NOT NULL,
    "source" "Source" NOT NULL,
    "notes" TEXT,
    "tags" JSONB,
    "status" "Status" NOT NULL DEFAULT 'New',
    "ownerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerHistory" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" JSONB NOT NULL,

    CONSTRAINT "BuyerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Buyer_updatedAt_idx" ON "Buyer"("updatedAt");

-- CreateIndex
CREATE INDEX "Buyer_city_propertyType_status_timeline_idx" ON "Buyer"("city", "propertyType", "status", "timeline");

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerHistory" ADD CONSTRAINT "BuyerHistory_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
