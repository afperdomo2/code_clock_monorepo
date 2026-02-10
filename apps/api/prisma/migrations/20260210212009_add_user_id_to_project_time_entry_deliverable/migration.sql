/*
  Warnings:

  - Added the required column `user_id` to the `deliverables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `time_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deliverables" ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "time_entries" ADD COLUMN     "user_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "deliverables_user_id_idx" ON "deliverables"("user_id");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "time_entries_user_id_idx" ON "time_entries"("user_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
