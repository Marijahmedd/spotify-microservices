// src/index.ts
import Fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();

import songRoutes from "./routes/songs.routes";
import { registerRedisSubscriptions } from "./redis/subscriptions";

const fastify = Fastify({ logger: true });

// Register Routes
registerRedisSubscriptions();
fastify.register(songRoutes, { prefix: "/api/song" });

const start = async () => {
  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 7000,
      host: "0.0.0.0",
    });
    console.log("🎵 Song Service running...");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
