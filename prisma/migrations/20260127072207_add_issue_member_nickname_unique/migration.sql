/*
  Warnings:

  - A unique constraint covering the columns `[issue_id,nickname]` on the table `issue_members` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `issue_members_issue_id_deleted_at_nickname_key` ON `issue_members`;

-- CreateIndex
CREATE UNIQUE INDEX `issue_members_issue_id_nickname_key` ON `issue_members`(`issue_id`, `nickname`);
