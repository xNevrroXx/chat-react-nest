/*
  Warnings:

  - You are about to drop the column `filename` on the `file` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `filename`,
    ADD COLUMN `file_name` VARCHAR(191) NOT NULL;
