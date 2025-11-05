import Redis from "ioredis";

export const redis = new Redis({
      host: process.env.REDIS_C,
      port: 19824,
      username: "default",
      password: process.env.REDIS_PASS
    });