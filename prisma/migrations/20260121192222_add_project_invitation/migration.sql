-- CreateTable
CREATE TABLE `project_invitaions` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `project_invitaions_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_invitees` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isAccepted` BOOLEAN NOT NULL DEFAULT false,
    `acceptedAt` DATETIME(3) NULL,
    `invitationId` VARCHAR(191) NOT NULL,

    INDEX `project_invitees_email_idx`(`email`),
    UNIQUE INDEX `project_invitees_invitationId_email_key`(`invitationId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
