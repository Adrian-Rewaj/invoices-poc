/*
  Warnings:

  - A unique constraint covering the columns `[payToken]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payToken` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "payToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_payToken_key" ON "Invoice"("payToken");
