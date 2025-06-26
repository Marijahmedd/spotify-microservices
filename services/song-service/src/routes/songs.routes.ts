import { FastifyInstance, FastifyRequest } from "fastify";
import {
  streamSong,
  getAlbums,
  getAlbumData,
  getAllSongs,
} from "../controller/songs.controller";

export default async function songRoutes(fastify: FastifyInstance) {
  fastify.get("/stream/:id", streamSong);
  fastify.get("/album", getAlbums);
  fastify.get("/album/:id", getAlbumData);
  fastify.get("/", getAllSongs);
}
