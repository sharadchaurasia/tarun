/*
  Warnings:

  - The `lead_status` column on the `conversations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "lead_status",
ADD COLUMN     "lead_status" TEXT;

-- DropEnum
DROP TYPE "LeadStatus";

-- CreateTable
CREATE TABLE "custom_lead_statuses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_lead_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "trigger" JSONB NOT NULL DEFAULT '{}',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_logs" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_lead_statuses_tenant_id_sort_order_idx" ON "custom_lead_statuses"("tenant_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "custom_lead_statuses_tenant_id_name_key" ON "custom_lead_statuses"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "conversation_notes_conversation_id_created_at_idx" ON "conversation_notes"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "chatbot_workflows_tenant_id_is_active_idx" ON "chatbot_workflows"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "workflow_logs_workflow_id_executed_at_idx" ON "workflow_logs"("workflow_id", "executed_at" DESC);

-- CreateIndex
CREATE INDEX "conversations_tenant_id_lead_status_idx" ON "conversations"("tenant_id", "lead_status");

-- AddForeignKey
ALTER TABLE "custom_lead_statuses" ADD CONSTRAINT "custom_lead_statuses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_notes" ADD CONSTRAINT "conversation_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_notes" ADD CONSTRAINT "conversation_notes_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_notes" ADD CONSTRAINT "conversation_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_workflows" ADD CONSTRAINT "chatbot_workflows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "chatbot_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
