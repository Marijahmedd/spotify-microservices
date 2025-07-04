import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/dbConnect";
import { generateSignedCloudFrontUrl } from "../utils/cloudfrontSigner";
import redis from "../lib/redisClient";

export const streamSong = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  let audioKey: string;

  try {
    const cachedKey = await redis.get(`stream:${id}`);

    if (cachedKey) {
      audioKey = cachedKey;
      console.log("✅ Cache hit for streaming of song:", id);
    } else {
      console.log("❌ Cache miss, querying DB...");
      const song = await prisma.song.findUnique({ where: { id } });

      if (!song) {
        return reply.status(404).send({ message: "Song not found" });
      }

      audioKey = song.audioKey;
      await redis.set(`stream:${id}`, audioKey, "EX", 12 * 60 * 60);
    }

    const signedUrl = generateSignedCloudFrontUrl(audioKey);
    return reply.status(200).send({ url: signedUrl });
  } catch (error) {
    console.error("Error streaming song:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const getAlbums = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const cacheKey = "albums:all";
  try {
    const cachedAlbums = await redis.get(cacheKey);
    if (cachedAlbums) {
      console.log("✅ Cache hit for albums");
      return reply.status(200).send({ albums: JSON.parse(cachedAlbums) });
    }
    console.log("❌ Cache miss. Querying DB...");

    const albums = await prisma.album.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        artist: true,
        thumbnailKey: true,
        createdAt: true,
      },
    });
    await redis.set(cacheKey, JSON.stringify(albums), "EX", 600);
    return reply.status(200).send({ albums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const getAlbumData = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const cacheKey = `album:${id}`;

  try {
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("✅ Album cache hit");
      return reply.send(JSON.parse(cachedData));
    }

    console.log("❌ Cache miss, querying DB...");

    const album = await prisma.album.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        artist: true,
        thumbnailKey: true,
        createdAt: true,
        songs: {
          select: {
            id: true,
            title: true,
            artist: true,
            duration: true,
            imageUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!album) {
      return reply.status(404).send({ message: "Album not found" });
    }
    const response = {
      album: {
        id: album.id,
        name: album.name,
        artist: album.artist,
        thumbnailUrl: `${process.env.CLOUDFRONT_DOMAIN}/${album.thumbnailKey}`,
        createdAt: album.createdAt,
      },
      songs: album.songs,
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", 600); // cache for 10 minutes

    return reply.send(response);
  } catch (error) {
    console.error("Error fetching album:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const getSongData = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const song = await prisma.song.findUnique({
      where: { id },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        artist: true,
        duration: true,
        createdAt: true,
      },
    });

    if (!song) {
      return reply.status(404).send({ message: "song not found" });
    }

    return reply.send(song);
  } catch (error) {
    console.error("Error fetching album:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};

export const getAllSongs = async (req: FastifyRequest, reply: FastifyReply) => {
  const cacheKey = "songs:all";

  try {
    // 1. Try Redis cache
    const cachedSongs = await redis.get(cacheKey);
    if (cachedSongs) {
      console.log("✅ Cache hit for all songs");
      return reply.status(200).send(JSON.parse(cachedSongs));
    }

    // 2. Query DB if not in cache
    console.log("❌ Cache miss, querying DB...");
    const songs = await prisma.song.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,

        title: true,
        artist: true,
        imageUrl: true,
        duration: true,
        audioKey: true,
        albumId: true,
        createdAt: true,
      },
    });

    // 3. Save in Redis (10 min TTL)
    await redis.set(cacheKey, JSON.stringify(songs), "EX", 10 * 60);

    return reply.status(200).send(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
};
