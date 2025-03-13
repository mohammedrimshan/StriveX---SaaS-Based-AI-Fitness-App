import { createClient } from "redis";
import { config } from "../../shared/config";

const client = createClient({
	username: config.redis.REDIS_USERNAME,
	password: config.redis.REDIS_PASS,
	socket: {
		host: config.redis.REDIS_HOST,
		port: config.redis.REDIS_PORT,
	},
});

client.on("error", (err) => {
	console.log("\n❌ 🚨 Redis Client Error 🚨 ❌");
	console.error(err);
});

(async () => {
	await client.connect();
	console.log("\n==========================================");
	console.log("🎯 🚀 Redis Connected Successfully! 📦 🎯");
	console.log("==========================================\n");
})();

export default client;
