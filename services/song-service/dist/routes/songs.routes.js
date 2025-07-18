"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = songRoutes;
const songs_controller_1 = require("../controller/songs.controller");
async function songRoutes(fastify) {
    fastify.get("/stream/:id", songs_controller_1.streamSong);
    fastify.get("/album", songs_controller_1.getAlbums);
    fastify.get("/album/:id", songs_controller_1.getAlbumData);
    fastify.get("/", songs_controller_1.getAllSongs);
    // fastify.get("/:id", getSongData);
}
