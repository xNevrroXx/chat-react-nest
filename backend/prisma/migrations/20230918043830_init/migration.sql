/*
  Warnings:

  - You are about to drop the column `hasRead` on the `message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `message` DROP COLUMN `hasRead`,
    ADD COLUMN `has_read` BOOLEAN NOT NULL DEFAULT false;
