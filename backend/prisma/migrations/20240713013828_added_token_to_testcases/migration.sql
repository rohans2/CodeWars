/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "token" TEXT;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "time" DROP NOT NULL,
ALTER COLUMN "memory" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Submission_token_key" ON "Submission"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_token_key" ON "TestCase"("token");
