import Queue from "bull";
import { config } from "../../../shared/config";
import client from "../../cache/redis.client";

const slotExpiryQueue = new Queue("slot-expiry", {
  redis: {
    host: config.redis.REDIS_HOST,
    port: config.redis.REDIS_PORT,
    username: config.redis.REDIS_USERNAME,
    password: config.redis.REDIS_PASS,
  },
});

export default slotExpiryQueue;