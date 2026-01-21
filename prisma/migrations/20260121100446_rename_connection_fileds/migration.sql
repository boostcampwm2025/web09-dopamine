/*
  Warnings:

  - You are about to drop the column `issue_a_id` on the `issue_connections` table. All the data in the column will be lost.
  - You are about to drop the column `issue_b_id` on the `issue_connections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[source_issue_id,target_issue_id,deleted_at]` on the table `issue_connections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source_issue_id` to the `issue_connections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_issue_id` to the `issue_connections` table without a default value. This is not possible if the table is not empty.

*/

DELETE FROM `issue_connections`;

-- DropIndex
DROP INDEX `issue_connections_issue_a_id_issue_b_id_deleted_at_key` ON `issue_connections`;

-- DropIndex
DROP INDEX `issue_connections_issue_b_id_idx` ON `issue_connections`;

-- AlterTable
ALTER TABLE `issue_connections` DROP COLUMN `issue_a_id`,
    DROP COLUMN `issue_b_id`,
    ADD COLUMN `source_issue_id` CHAR(36) NOT NULL,
    ADD COLUMN `target_issue_id` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `issue_connections_target_issue_id_idx` ON `issue_connections`(`target_issue_id`);

-- CreateIndex
CREATE UNIQUE INDEX `issue_connections_source_issue_id_target_issue_id_deleted_at_key` ON `issue_connections`(`source_issue_id`, `target_issue_id`, `deleted_at`);
