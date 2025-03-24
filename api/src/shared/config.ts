import dotenv from "dotenv";
import { cleanEnv, str, port, num } from "envalid"; 

dotenv.config();

const env = cleanEnv(process.env, {
    CORS_ALLOWED_ORIGIN: str({ default: "http://localhost:5173" }),
    PORT: port({ default: 5000 }),
    NODE_ENV: str({ default: "development" }),
    DATABASE_URI: str(),
    EMAIL_USER: str(),
    EMAIL_PASS: str(),
    JWT_ACCESS_KEY: str({ default: "access-secret-key" }),
    JWT_REFRESH_KEY: str({ default: "refresh-secret-key" }),
    JWT_ACCESS_EXPIRES_IN: str({ default: "15m" }),
    JWT_REFRESH_EXPIRES_IN: str({ default: "7d" }),
    REDIS_USERNAME: str({ default: "default" }),
    REDIS_PASS: str(),
    REDIS_HOST: str(),
    REDIS_PORT: num({ default: 16807 }),
    OTP_EXPIRY_IN_MINUTES: num({ default: 2 }),
    LOGGER_STATUS: str({ default: "dev" }),
    BCRYPT_SALT_ROUNDS: num({ default: 10 }),
});

export const config = {
    cors: { ALLOWED_ORIGIN: env.CORS_ALLOWED_ORIGIN },
    server: { PORT: env.PORT, NODE_ENV: env.NODE_ENV },
    database: { URI: env.DATABASE_URI },
    nodemailer: { EMAIL_USER: env.EMAIL_USER, EMAIL_PASS: env.EMAIL_PASS },
    jwt: {
        ACCESS_SECRET_KEY: env.JWT_ACCESS_KEY,
        REFRESH_SECRET_KEY: env.JWT_REFRESH_KEY,
        RESET_SECRET_KEY: process.env.JWT_RESET_KEY || "reset-secret-key",
        ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
        REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
        RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN || "24h",
    },
    redis: {
        REDIS_USERNAME: env.REDIS_USERNAME,
        REDIS_PASS: env.REDIS_PASS,
        REDIS_HOST: env.REDIS_HOST,
        REDIS_PORT: env.REDIS_PORT,
    },
    OtpExpiry: env.OTP_EXPIRY_IN_MINUTES,
    loggerStatus: env.LOGGER_STATUS,
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
};
