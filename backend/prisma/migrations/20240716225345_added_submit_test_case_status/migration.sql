-- AlterEnum
ALTER TYPE "CaseStatus" ADD VALUE 'SUBMIT';

-- AlterTable
ALTER TABLE "TestCase" ALTER COLUMN "token" DROP NOT NULL;
