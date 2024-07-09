/*
  Warnings:

  - Added the required column `code` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "submissionId" TEXT;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
