/*
  Warnings:

  - A unique constraint covering the columns `[issue_id,deleted_at,nickname]` on the table `issue_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[issue_id,deleted_at,user_id]` on the table `issue_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `issue_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `issue_members_issue_id_user_id_deleted_at_key` ON `issue_members`;

-- AlterTable
ALTER TABLE `issue_members` ADD COLUMN `nickname` VARCHAR(30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `issue_members_issue_id_deleted_at_nickname_key` ON `issue_members`(`issue_id`, `deleted_at`, `nickname`);

-- CreateIndex
CREATE UNIQUE INDEX `issue_members_issue_id_deleted_at_user_id_key` ON `issue_members`(`issue_id`, `deleted_at`, `user_id`);
