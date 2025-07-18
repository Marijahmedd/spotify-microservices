"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRedisSubscriptions = void 0;
const redisClient_1 = __importDefault(require("../lib/redisClient"));
const redisSubscriber_1 = __importDefault(require("../lib/redisSubscriber"));
const registerRedisSubscriptions = () => {
    redisSubscriber_1.default.subscribe("song:created", "song:deleted", "album:created", "album:deleted", (err, count) => {
        if (err) {
            console.error("❌ Failed to subscribe to Redis channels", err);
        }
        else {
            console.log(`✅ Subscribed to ${count} Redis pubsub channels.`);
        }
    });
    redisSubscriber_1.default.on("message", async (channel, message) => {
        try {
            const data = JSON.parse(message);
            switch (channel) {
                case "song:created":
                    console.log("📥 Received song:created event:", data);
                    await redisClient_1.default.del("songs:all");
                    await redisClient_1.default.del(`album:${data.albumId}`);
                    break;
                case "song:deleted":
                    console.log("Received song:deleted event:", data);
                    await redisClient_1.default.del("songs:all");
                    await redisClient_1.default.del(`album:${data.albumId}`);
                    await redisClient_1.default.del(`stream:${data.songId}`);
                    break;
                case "album:created":
                    console.log("Received album:created event:", data);
                    await redisClient_1.default.del("albums:all");
                    break;
                case "album:deleted":
                    console.log("Received album:deleted event:", data);
                    await redisClient_1.default.del("albums:all");
                    await redisClient_1.default.del(`album:${data.albumId}`);
                    await redisClient_1.default.del("songs:all");
                    break;
                default:
                    console.log("Unknown event:", channel);
            }
        }
        catch (err) {
            console.error("Error handling pubsub event:", err);
        }
    });
};
exports.registerRedisSubscriptions = registerRedisSubscriptions;
