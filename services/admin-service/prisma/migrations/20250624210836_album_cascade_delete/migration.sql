-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_albumId_fkey";

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
