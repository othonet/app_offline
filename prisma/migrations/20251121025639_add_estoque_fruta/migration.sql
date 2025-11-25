-- CreateTable
CREATE TABLE `estoque_fruta` (
    `id` VARCHAR(191) NOT NULL,
    `cabecaId` VARCHAR(191) NOT NULL,
    `valvulaId` VARCHAR(191) NOT NULL,
    `variedade` VARCHAR(191) NOT NULL,
    `quantidadeContentores` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `estoque_fruta_cabecaId_valvulaId_variedade_key`(`cabecaId`, `valvulaId`, `variedade`),
    INDEX `estoque_fruta_cabecaId_idx`(`cabecaId`),
    INDEX `estoque_fruta_valvulaId_idx`(`valvulaId`),
    INDEX `estoque_fruta_variedade_idx`(`variedade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `estoque_fruta` ADD CONSTRAINT `estoque_fruta_cabecaId_fkey` FOREIGN KEY (`cabecaId`) REFERENCES `cabecas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estoque_fruta` ADD CONSTRAINT `estoque_fruta_valvulaId_fkey` FOREIGN KEY (`valvulaId`) REFERENCES `valvulas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

