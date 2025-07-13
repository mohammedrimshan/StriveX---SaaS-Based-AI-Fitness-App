"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.join(process.cwd(), "logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
}));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: "info",
    format: fileFormat,
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "error.log"),
            level: "error",
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, "combined.log"),
        }),
    ],
});
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
exports.default = logger;
