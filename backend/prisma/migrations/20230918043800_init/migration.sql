/*
  Warnings:

  - You are about to drop the column `type_msg` on the `message` table. All the data in the column will be lost.
  - Added the required column `type` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `type_msg`,
    ADD COLUMN `hasRead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` ENUM('AUDIO', 'TEXT', 'VIDEO') NOT NULL;
