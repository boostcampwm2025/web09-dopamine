/*
  Warnings:

  - A unique constraint covering the columns `[issue_id,user_id]` on the table `issue_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `issue_members_issue_id_deleted_at_user_id_key` ON `issue_members`;

-- CreateIndex
CREATE UNIQUE INDEX `issue_members_issue_id_user_id_key` ON `issue_members`(`issue_id`, `user_id`);
