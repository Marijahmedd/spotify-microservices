import redis from "../lib/redisClient";

export const publishEvent = async (channel: string, payload: object) => {
  const message = JSON.stringify(payload);
  await redis.publish(channel, message);
};
