-- AlterTable: tasks の start_date / end_date を nullable に変更
ALTER TABLE "tasks" ALTER COLUMN "start_date" DROP NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "end_date" DROP NOT NULL;
