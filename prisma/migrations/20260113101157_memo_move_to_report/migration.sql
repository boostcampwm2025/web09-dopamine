/*
  Warnings:

  - You are about to drop the column `memo` on the `ideas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ideas` DROP COLUMN `memo`;

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `memo` TEXT NULL;
