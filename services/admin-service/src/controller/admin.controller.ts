import { s3Client } from "../utils/s3";
import { prisma } from "../lib/dbConnect";
import { Request, Response } from "express";
import { publishEvent } from "../utils/pubsub";
export const test = async (req: Request, res: Response) => {
  res.status(201).json({
    message: "api working correctly",
  });
  return;
};

import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

export const testS3 = async (req: Request, res: Response) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 1,
    });

    await s3Client.send(command);
    res.json({ message: "AWS s3 connection successful!" });
    return;
  } catch (error) {
    res.status(500).json({ error: "AWS connection failed" });
    return;
  }
};

import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type UploadType = "thumbnail" | "song";

const allowedTypes: Record<
  UploadType,
  {
    contentType: string;
    extension: string;
    folder: string;
  }
> = {
  thumbnail: {
    contentType: "image/jpeg",
    extension: "jpg",
    folder: "thumbnails",
  },
  song: {
    contentType: "audio/mpeg",
    extension: "mp3",
    folder: "songs",
  },
};

export const uploadURL = async (req: Request, res: Response) => {
  const { type } = req.body;

  if (type !== "thumbnail" && type !== "song") {
    res.status(400).json({
      error: "Invalid or missing type. Must be 'thumbnail' or 'song'.",
    });
    return;
  }

  const uploadType = type as UploadType;
  const config = allowedTypes[uploadType];

  const fileKey = `${config.folder}/${randomUUID()}.${config.extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
    ContentType: config.contentType,
  });

  try {
    const presignedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    res.status(200).json({ presignedURL, fileKey });
    return;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
    return;
  }
};
export const getAlbum = async (req: Request, res: Response) => {
  try {
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

    res.status(200).json({ albums });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { name, artist, thumbnailKey } = req.body;

    if (!name || !artist || !thumbnailKey) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    if (!thumbnailKey.startsWith("thumbnails/")) {
      res.status(400).json({ message: "Invalid thumbnail path" });
      return;
    }

    const newAlbum = await prisma.album.create({
      data: {
        name,
        artist,
        thumbnailKey,
      },
    });
    await publishEvent("album:created", {
      albumId: newAlbum.id,
    });
    res.status(201).json({ message: "Album created", album: newAlbum });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const deleteAlbum = async (req: Request, res: Response) => {
  const albumId = req.params.id;

  try {
    // Check if album exists
    const album = await prisma.album.findUnique({
      where: { id: albumId },
    });

    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }

    // Delete the album — songs will cascade delete
    await prisma.album.delete({
      where: { id: albumId },
    });
    await publishEvent("album:deleted", {
      albumId: albumId,
    });
    res.status(200).json({ message: "Album and its songs deleted" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const createSong = async (req: Request, res: Response) => {
  try {
    const { title, artist, audioKey, duration, albumId, imageUrl } = req.body;

    if (!title || !artist || !audioKey || !duration || !albumId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    if (!audioKey.startsWith("songs/")) {
      res.status(400).json({ message: "Invalid audioKey path" });
      return;
    }
    // Ensure the album exists
    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        audioKey,
        duration: parseFloat(duration),
        albumId,
        imageUrl,
      },
    });
    await publishEvent("song:created", {
      songId: song.id,
      albumId: song.albumId,
    });
    res.status(201).json({ message: "Song created", song });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export const deleteSong = async (req: Request, res: Response) => {
  const songId = req.params.id;

  try {
    // Check if album exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      res.status(404).json({ message: "Song not found" });
      return;
    }

    // Delete the album — songs will cascade delete
    await prisma.song.delete({
      where: { id: songId },
    });
    await publishEvent("song:deleted", {
      songId: songId,
      albumId: song.albumId,
    });
    res.status(200).json({ message: "Song deleted" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
export const getSongsOfAlbums = async (req: Request, res: Response) => {
  const albumId = req.params.id;
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    res.status(404).json({ message: "Album not found" });
    return;
  }
  try {
    const songs = await prisma.song.findMany({
      where: { albumId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        artist: true,
        duration: true,
        createdAt: true,
      },
    });

    res.status(200).json({ songs });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
