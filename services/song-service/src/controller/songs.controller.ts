import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/dbConnect";
import { generateSignedCloudFrontUrl } from "../utils/cloudfrontSigner";

export const streamSong = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const song = await prisma.song.findUnique({ where: { id } });

    if (!song) {
      return reply.status(404).send({ message: "Song not found" });
    }

    const signedUrl = generateSignedCloudFrontUrl(song.audioKey);

    return reply.status(200).send({
      url: signedUrl,
    });
  } catch (err) {
    console.error("Error streaming song:", err);
    return reply.status(500).send({ message: "Internal server error" });
  }
};
