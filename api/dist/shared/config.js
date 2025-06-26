"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const envalid_1 = require("envalid");
dotenv_1.default.config();
const env = (0, envalid_1.cleanEnv)(process.env, {
    CORS_ALLOWED_ORIGIN: (0, envalid_1.str)({ default: "https://strivex.rimshan.in" }),
    PORT: (0, envalid_1.port)({ default: 5000 }),
    NODE_ENV: (0, envalid_1.str)({ default: "production" }),
    DATABASE_URI: (0, envalid_1.str)(),
    EMAIL_USER: (0, envalid_1.str)(),
    EMAIL_PASS: (0, envalid_1.str)(),
    JWT_ACCESS_KEY: (0, envalid_1.str)({ default: "access-secret-key" }),
    JWT_REFRESH_KEY: (0, envalid_1.str)({ default: "refresh-secret-key" }),
    JWT_RESET_KEY: (0, envalid_1.str)({ default: "reset-secret-key" }),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)({ default: "15m" }),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)({ default: "7d" }),
    JWT_RESET_EXPIRES_IN: (0, envalid_1.str)({ default: "24h" }),
    REDIS_USERNAME: (0, envalid_1.str)({ default: "default" }),
    REDIS_PASS: (0, envalid_1.str)(),
    REDIS_HOST: (0, envalid_1.str)(),
    REDIS_PORT: (0, envalid_1.num)({ default: 16807 }),
    OTP_EXPIRY_IN_MINUTES: (0, envalid_1.num)({ default: 2 }),
    LOGGER_STATUS: (0, envalid_1.str)({ default: "dev" }),
    BCRYPT_SALT_ROUNDS: (0, envalid_1.num)({ default: 10 }),
    GEMINI_API_KEY: (0, envalid_1.str)(),
    VITE_ZEGO_APP_ID: (0, envalid_1.str)(),
    VITE_ZEGO_SERVER_URL: (0, envalid_1.str)(),
    ZEGO_SERVER_SECRET: (0, envalid_1.str)(),
    MAKERSUITE_KEY: (0, envalid_1.str)()
});
exports.config = {
    cors: { ALLOWED_ORIGIN: env.CORS_ALLOWED_ORIGIN },
    server: { PORT: env.PORT, NODE_ENV: env.NODE_ENV },
    database: { URI: env.DATABASE_URI },
    gemini: { GEMINI_API_KEY: env.GEMINI_API_KEY, MAKERSUITE_KEY: env.MAKERSUITE_KEY },
    nodemailer: { EMAIL_USER: env.EMAIL_USER, EMAIL_PASS: env.EMAIL_PASS },
    jwt: {
        ACCESS_SECRET_KEY: env.JWT_ACCESS_KEY,
        REFRESH_SECRET_KEY: env.JWT_REFRESH_KEY,
        RESET_SECRET_KEY: env.JWT_RESET_KEY || "reset-secret-key",
        ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
        REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
        RESET_EXPIRES_IN: env.JWT_RESET_EXPIRES_IN || "24h",
    },
    redis: {
        REDIS_USERNAME: env.REDIS_USERNAME,
        REDIS_PASS: env.REDIS_PASS,
        REDIS_HOST: env.REDIS_HOST,
        REDIS_PORT: env.REDIS_PORT,
    },
    zegocloud: {
        APP_ID: env.VITE_ZEGO_APP_ID,
        SERVER_URL: env.VITE_ZEGO_SERVER_URL,
        SERVER_SECRET: env.ZEGO_SERVER_SECRET,
    },
    OtpExpiry: env.OTP_EXPIRY_IN_MINUTES,
    loggerStatus: env.LOGGER_STATUS,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
};
