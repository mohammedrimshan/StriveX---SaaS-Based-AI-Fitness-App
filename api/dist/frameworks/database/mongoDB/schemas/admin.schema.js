"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSchema = void 0;
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
exports.adminSchema = new mongoose_1.Schema({
    fcmToken: { type: String, required: false, default: null },
    clientId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: constants_1.ROLES, required: true },
    isAdmin: { type: Boolean, default: false },
    profileImage: { type: String },
    status: { type: String, default: "active" },
}, {
    timestamps: true,
});
