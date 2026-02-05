/*
  Warnings:

  - A unique constraint covering the columns `[idea_id,user_id,isActive]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `votes_idea_id_user_id_deleted_at_key` ON `votes`;

-- AlterTable
ALTER TABLE `votes` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `votes_idea_id_user_id_isActive_key` ON `votes`(`idea_id`, `user_id`, `isActive`);
