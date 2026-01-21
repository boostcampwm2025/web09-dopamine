-- CreateTable
CREATE TABLE `ProjectInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProjectInvitation_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectInvitee` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `isAccepted` BOOLEAN NOT NULL DEFAULT false,
    `acceptedAt` DATETIME(3) NULL,
    `invitationId` VARCHAR(191) NOT NULL,

    INDEX `ProjectInvitee_email_idx`(`email`),
    UNIQUE INDEX `ProjectInvitee_invitationId_email_key`(`invitationId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
