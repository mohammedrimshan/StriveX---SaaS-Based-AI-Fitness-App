"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const config_1 = require("../../../shared/config");
const slotExpiryQueue = new bull_1.default("slot-expiry", {
    redis: {
        host: config_1.config.redis.REDIS_HOST,
        port: config_1.config.redis.REDIS_PORT,
        username: config_1.config.redis.REDIS_USERNAME,
        password: config_1.config.redis.REDIS_PASS,
    },
});
exports.default = slotExpiryQueue;
