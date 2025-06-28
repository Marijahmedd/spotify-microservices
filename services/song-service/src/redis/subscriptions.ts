import redisClient from "../lib/redisClient";
import redisSubscriber from "../lib/redisSubscriber";

export const registerRedisSubscriptions = () => {
  redisSubscriber.subscribe(
    "song:created",
    "song:deleted",
    "album:created",
    "album:deleted",
    (err, count) => {
      if (err) {
        console.error("❌ Failed to subscribe to Redis channels", err);
      } else {
        console.log(`✅ Subscribed to ${count} Redis pubsub channels.`);
      }
    }
  );

  redisSubscriber.on("message", async (channel, message) => {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case "song:created":
          console.log("📥 Received song:created event:", data);
          await redisClient.del("songs:all");
          await redisClient.del(`album:${data.albumId}`);
          break;

        case "song:deleted":
          console.log("Received song:deleted event:", data);
          await redisClient.del("songs:all");
          await redisClient.del(`album:${data.albumId}`);
          await redisClient.del(`stream:${data.songId}`);
          break;

        case "album:created":
          console.log("Received album:created event:", data);
          await redisClient.del("albums:all");
          break;

        case "album:deleted":
          console.log("Received album:deleted event:", data);
          await redisClient.del("albums:all");
          await redisClient.del(`album:${data.albumId}`);
          break;

        default:
          console.log("Unknown event:", channel);
      }
    } catch (err) {
      console.error("Error handling pubsub event:", err);
    }
  });
};
