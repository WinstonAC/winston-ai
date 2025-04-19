/*
  Warnings:

  - You are about to drop the column `company` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Lead_email_key";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "company",
DROP COLUMN "createdAt",
DROP COLUMN "notes",
DROP COLUMN "phone",
DROP COLUMN "position",
DROP COLUMN "sentAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Sent';

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
