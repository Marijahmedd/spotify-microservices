import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
  console.log("Redis subscriber connected");
});

redis.on("error", (err) => {
  console.error("Redis subscriber connection error:", err);
});

export default redis;
