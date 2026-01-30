-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'FOLLOW_UP', 'CALLBACK', 'CONVERTED', 'LOST');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "lead_status" "LeadStatus";

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "outcome" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_logs_tenant_id_conversation_id_idx" ON "call_logs"("tenant_id", "conversation_id");

-- CreateIndex
CREATE INDEX "call_logs_conversation_id_created_at_idx" ON "call_logs"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "conversations_tenant_id_lead_status_idx" ON "conversations"("tenant_id", "lead_status");

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
