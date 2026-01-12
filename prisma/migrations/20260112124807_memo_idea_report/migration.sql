/*
  Warnings:

  - You are about to drop the column `memo` on the `ideas` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `issues` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.

*/
-- 기존 status 값을 새 ENUM 값으로 변환
UPDATE `issues` SET `status` = 'CLOSE' WHERE `status` = 'CLOSED';
UPDATE `issues` SET `status` = 'BRAINSTORMING' WHERE `status` = 'OPEN';

-- AlterTable
ALTER TABLE `ideas` DROP COLUMN `memo`;

-- AlterTable
ALTER TABLE `issues` MODIFY `status` ENUM('BRAINSTORMING', 'CATEGORIZE', 'VOTE', 'SELECT', 'CLOSE') NOT NULL DEFAULT 'BRAINSTORMING';

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `memo` TEXT NULL;
