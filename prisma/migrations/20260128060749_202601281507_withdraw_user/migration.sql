-- AlterTable
ALTER TABLE `comments` MODIFY `user_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `ideas` MODIFY `user_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `projects` MODIFY `owner_id` CHAR(36) NULL;

-- AlterTable
ALTER TABLE `votes` MODIFY `user_id` CHAR(36) NULL;
