import { FastifyInstance, FastifyRequest } from "fastify";
import { streamSong } from "../controller/songs.controller";

export default async function songRoutes(fastify: FastifyInstance) {
  fastify.get("/stream/:id", streamSong);
}
