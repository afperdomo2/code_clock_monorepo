-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token_expires_at" TIMESTAMPTZ(6),
ADD COLUMN     "refresh_token_hash" VARCHAR(255);

-- CreateIndex
CREATE INDEX "users_refresh_token_hash_idx" ON "users"("refresh_token_hash");
