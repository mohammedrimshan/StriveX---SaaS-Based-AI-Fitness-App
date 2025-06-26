"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataParser = void 0;
const express_1 = __importDefault(require("express"));
const dataParser = (req, res, next) => {
    if (req.originalUrl.includes("/client/payment/webhook")) {
        express_1.default.raw({ type: "application/json" })(req, res, (err) => {
            if (err)
                return next(err);
            req.rawBody = req.body;
            next();
        });
    }
    else {
        express_1.default.json()(req, res, next);
    }
};
exports.dataParser = dataParser;
