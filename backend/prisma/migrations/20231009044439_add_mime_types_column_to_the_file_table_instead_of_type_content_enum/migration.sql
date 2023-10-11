/*
  Warnings:

  - You are about to drop the column `type` on the `file` table. All the data in the column will be lost.
  - Added the required column `mime_type` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `type`,
    ADD COLUMN `mime_type` VARCHAR(191) NOT NULL;
