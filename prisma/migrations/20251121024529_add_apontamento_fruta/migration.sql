-- CreateTable
CREATE TABLE `apontamentos_fruta` (
    `id` VARCHAR(191) NOT NULL,
    `numeroCarroca` VARCHAR(191) NOT NULL,
    `cabecaId` VARCHAR(191) NOT NULL,
    `valvulaId` VARCHAR(191) NOT NULL,
    `variedade` VARCHAR(191) NOT NULL,
    `numeroContentores` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `apontamentos_fruta_cabecaId_idx`(`cabecaId`),
    INDEX `apontamentos_fruta_valvulaId_idx`(`valvulaId`),
    INDEX `apontamentos_fruta_userId_idx`(`userId`),
    INDEX `apontamentos_fruta_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apontamentos_fruta` ADD CONSTRAINT `apontamentos_fruta_cabecaId_fkey` FOREIGN KEY (`cabecaId`) REFERENCES `cabecas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apontamentos_fruta` ADD CONSTRAINT `apontamentos_fruta_valvulaId_fkey` FOREIGN KEY (`valvulaId`) REFERENCES `valvulas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apontamentos_fruta` ADD CONSTRAINT `apontamentos_fruta_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

