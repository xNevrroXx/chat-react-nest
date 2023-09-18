/*
  Warnings:

  - The primary key for the `refresh_token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `refresh_token` table. All the data in the column will be lost.
  - Added the required column `token` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_token` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    ADD COLUMN `token` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
