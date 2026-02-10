-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('Empresa', 'Personal', 'Freelance');

-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('Alta', 'Media', 'Baja');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Activo', 'Finalizado', 'Pausa', 'Pendiente');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "client" VARCHAR(255),
    "category" "ProjectCategory" NOT NULL,
    "priority" "ProjectPriority" NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "hours_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours_estimated" DOUBLE PRECISION,
    "deadline" TIMESTAMPTZ(6),
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "activity_type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "end_time" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "deadline" TIMESTAMPTZ(6),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_entries_project_id_idx" ON "time_entries"("project_id");

-- CreateIndex
CREATE INDEX "deliverables_project_id_idx" ON "deliverables"("project_id");

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
