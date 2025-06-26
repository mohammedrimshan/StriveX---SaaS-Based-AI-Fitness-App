"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = void 0;
const mongoose_1 = require("mongoose");
exports.RefreshTokenSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    userType: {
        type: String,
        enum: ["admin", "client", "trainer"],
        required: true,
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
