/*
  Warnings:

  - Added the required column `type` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` ADD COLUMN `type` ENUM('TEXT', 'AUDIO', 'VIDEO', 'VOICE', 'OTHER') NOT NULL;
