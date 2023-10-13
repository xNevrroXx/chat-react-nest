/*
  Warnings:

  - Added the required column `user_target_id` to the `UserTyping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usertyping` ADD COLUMN `user_target_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserTyping` ADD CONSTRAINT `UserTyping_user_target_id_fkey` FOREIGN KEY (`user_target_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
