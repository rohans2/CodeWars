-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "examples" TEXT,
ALTER COLUMN "defaultCode" DROP NOT NULL;
