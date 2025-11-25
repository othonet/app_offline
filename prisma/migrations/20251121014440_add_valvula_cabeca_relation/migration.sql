-- AlterTable
ALTER TABLE `valvulas` ADD COLUMN `cabecaId` VARCHAR(191) NULL;

-- Update existing records: associate with first active cabeça (if exists)
UPDATE `valvulas` v
SET v.`cabecaId` = (
    SELECT c.`id` 
    FROM `cabecas` c 
    WHERE c.`ativo` = true 
    ORDER BY c.`nome` ASC 
    LIMIT 1
)
WHERE v.`cabecaId` IS NULL 
AND EXISTS (SELECT 1 FROM `cabecas` WHERE `ativo` = true);

-- Make cabecaId required (only if all válvulas have cabecaId set)
-- Note: This will fail if there are válvulas without cabecaId, which is expected
ALTER TABLE `valvulas` MODIFY COLUMN `cabecaId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `valvulas` ADD CONSTRAINT `valvulas_cabecaId_fkey` FOREIGN KEY (`cabecaId`) REFERENCES `cabecas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

