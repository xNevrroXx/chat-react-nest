/*
  Warnings:

  - You are about to drop the `friendshop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `friendshop` DROP FOREIGN KEY `friendshop_user_id_1_fkey`;

-- DropForeignKey
ALTER TABLE `friendshop` DROP FOREIGN KEY `friendshop_user_id_2_fkey`;

-- DropTable
DROP TABLE `friendshop`;

-- CreateTable
CREATE TABLE `friendship` (
    `user_id_1` VARCHAR(191) NOT NULL,
    `user_id_2` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `friendship_user_id_1_user_id_2_key`(`user_id_1`, `user_id_2`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_user_id_1_fkey` FOREIGN KEY (`user_id_1`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendship` ADD CONSTRAINT `friendship_user_id_2_fkey` FOREIGN KEY (`user_id_2`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
