/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Album";

-- CreateTable
CREATE TABLE "album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_pkey" PRIMARY KEY ("id")
);
