-- DropForeignKey
ALTER TABLE `usertyping` DROP FOREIGN KEY `UserTyping_user_target_id_fkey`;

-- AlterTable
ALTER TABLE `usertyping` MODIFY `user_target_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `UserTyping` ADD CONSTRAINT `UserTyping_user_target_id_fkey` FOREIGN KEY (`user_target_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
