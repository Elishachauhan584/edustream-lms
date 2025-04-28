/*
  Warnings:

  - You are about to drop the `MuxData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `MuxData`;

-- CreateTable
CREATE TABLE `CloudflareVideo` (
    `id` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `chapterId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CloudflareVideo_chapterId_key`(`chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
