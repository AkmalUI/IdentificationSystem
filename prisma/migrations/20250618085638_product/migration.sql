/*
  Warnings:

  - The primary key for the `product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ItemUID]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product" DROP CONSTRAINT "product_pkey",
DROP COLUMN "id",
ADD COLUMN     "index" SERIAL NOT NULL,
ADD CONSTRAINT "product_pkey" PRIMARY KEY ("index");

-- CreateIndex
CREATE UNIQUE INDEX "product_ItemUID_key" ON "product"("ItemUID");
