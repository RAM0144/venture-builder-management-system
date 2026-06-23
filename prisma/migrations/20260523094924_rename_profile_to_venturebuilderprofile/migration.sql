/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "VentureBuilderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "legalEntityType" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "dateOfIncorporation" TIMESTAMP(3) NOT NULL,
    "gstNumber" TEXT,
    "registeredOfficeAddress" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactPersonDesignation" TEXT NOT NULL,
    "contactPersonEmail" TEXT NOT NULL,
    "contactPersonMobile" TEXT NOT NULL,
    "founderExperience" TEXT NOT NULL,
    "minimumViableProduct" TEXT,
    "mentorNetworkAccess" TEXT NOT NULL,
    "startupFrameworkApproach" TEXT NOT NULL,
    "startupTargetUnderstanding" TEXT NOT NULL,
    "startupTargetComments" TEXT,
    "coordinationCommitment" TEXT NOT NULL,
    "tier2Tier3Strategy" TEXT NOT NULL,
    "legalEntityProof" TEXT,
    "pastEngagementDocuments" TEXT[],
    "declarationAccuracy" BOOLEAN NOT NULL DEFAULT false,
    "declarationSchemeUnderstanding" BOOLEAN NOT NULL DEFAULT false,
    "profileCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VentureBuilderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VentureBuilderProfile_userId_key" ON "VentureBuilderProfile"("userId");

-- AddForeignKey
ALTER TABLE "VentureBuilderProfile" ADD CONSTRAINT "VentureBuilderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
