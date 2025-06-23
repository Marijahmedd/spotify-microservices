import { s3Client } from "../utils/s3";
// import { prisma } from "../lib/dbConnect";
import { Request, Response } from "express";
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
export const uploadURL = async (req: Request, res: Response) => {
  const { fileType, fileExtension } = req.body;
  if (!fileType || !fileExtension) {
    res.status(400).json({ error: "Missing fileType or fileExtension" });
  }
  const fileKey = `thumbnails/${randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });
  try {
    const presignedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    res.json({ presignedURL, fileKey });
    return;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate URL" });
  }
};
