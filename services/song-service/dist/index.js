"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors")); // ✅ import
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const songs_routes_1 = __importDefault(require("./routes/songs.routes"));
const subscriptions_1 = require("./redis/subscriptions");
const fastify = (0, fastify_1.default)({ logger: true });
// Register Routes
(0, subscriptions_1.registerRedisSubscriptions)();
fastify.register(songs_routes_1.default, { prefix: "/api/song" });
const start = async () => {
    try {
        await fastify.register(cors_1.default, {
            origin: "http://localhost:5173", // Or restrict to a domain like "http://localhost:5173"
            credentials: true,
        });
        await fastify.listen({
            port: Number(process.env.PORT) || 7000,
            host: "0.0.0.0",
        });
        console.log("🎵 Song Service running...");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
