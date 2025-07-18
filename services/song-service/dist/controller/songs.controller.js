"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSongs = exports.getSongData = exports.getAlbumData = exports.getAlbums = exports.streamSong = void 0;
const dbConnect_1 = require("../lib/dbConnect");
const cloudfrontSigner_1 = require("../utils/cloudfrontSigner");
const redisClient_1 = __importDefault(require("../lib/redisClient"));
const streamSong = async (request, reply) => {
    const { id } = request.params;
    let audioKey;
    try {
        const cachedKey = await redisClient_1.default.get(`stream:${id}`);
        if (cachedKey) {
            audioKey = cachedKey;
            console.log("✅ Cache hit for streaming of song:", id);
        }
        else {
            console.log("❌ Cache miss, querying DB...");
            const song = await dbConnect_1.prisma.song.findUnique({ where: { id } });
            if (!song) {
                return reply.status(404).send({ message: "Song not found" });
            }
            audioKey = song.audioKey;
            await redisClient_1.default.set(`stream:${id}`, audioKey, "EX", 12 * 60 * 60);
        }
        const signedUrl = (0, cloudfrontSigner_1.generateSignedCloudFrontUrl)(audioKey);
        return reply.status(200).send({ url: signedUrl });
    }
    catch (error) {
        console.error("Error streaming song:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};
exports.streamSong = streamSong;
const getAlbums = async (request, reply) => {
    const cacheKey = "albums:all";
    try {
        const cachedAlbums = await redisClient_1.default.get(cacheKey);
        if (cachedAlbums) {
            console.log("✅ Cache hit for albums");
            return reply.status(200).send({ albums: JSON.parse(cachedAlbums) });
        }
        console.log("❌ Cache miss. Querying DB...");
        const albums = await dbConnect_1.prisma.album.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                artist: true,
                thumbnailKey: true,
                createdAt: true,
            },
        });
        await redisClient_1.default.set(cacheKey, JSON.stringify(albums), "EX", 600);
        return reply.status(200).send({ albums });
    }
    catch (error) {
        console.error("Error fetching albums:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};
exports.getAlbums = getAlbums;
const getAlbumData = async (request, reply) => {
    const { id } = request.params;
    const cacheKey = `album:${id}`;
    try {
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log("✅ Album cache hit");
            return reply.send(JSON.parse(cachedData));
        }
        console.log("❌ Cache miss, querying DB...");
        const album = await dbConnect_1.prisma.album.findUnique({
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
        await redisClient_1.default.set(cacheKey, JSON.stringify(response), "EX", 600); // cache for 10 minutes
        return reply.send(response);
    }
    catch (error) {
        console.error("Error fetching album:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};
exports.getAlbumData = getAlbumData;
const getSongData = async (request, reply) => {
    const { id } = request.params;
    try {
        const song = await dbConnect_1.prisma.song.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching album:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};
exports.getSongData = getSongData;
const getAllSongs = async (req, reply) => {
    const cacheKey = "songs:all";
    try {
        // 1. Try Redis cache
        const cachedSongs = await redisClient_1.default.get(cacheKey);
        if (cachedSongs) {
            console.log("✅ Cache hit for all songs");
            return reply.status(200).send(JSON.parse(cachedSongs));
        }
        // 2. Query DB if not in cache
        console.log("❌ Cache miss, querying DB...");
        const songs = await dbConnect_1.prisma.song.findMany({
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
        await redisClient_1.default.set(cacheKey, JSON.stringify(songs), "EX", 10 * 60);
        return reply.status(200).send(songs);
    }
    catch (error) {
        console.error("Error fetching songs:", error);
        return reply.status(500).send({ message: "Internal server error" });
    }
};
exports.getAllSongs = getAllSongs;
