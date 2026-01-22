-- AlterTable
ALTER TABLE `issue_connections` ADD COLUMN `source_handle` VARCHAR(20) NULL,
    ADD COLUMN `target_handle` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `issue_nodes` (
    `id` CHAR(36) NOT NULL,
    `issue_id` CHAR(36) NOT NULL,
    `position_x` FLOAT NOT NULL,
    `position_y` FLOAT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `issue_nodes_issue_id_key`(`issue_id`),
    INDEX `issue_nodes_issue_id_idx`(`issue_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
