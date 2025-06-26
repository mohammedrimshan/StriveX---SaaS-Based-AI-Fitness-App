"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerSchema = exports.GENDER_ENUM = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
const constants_2 = require("@/shared/constants");
exports.GENDER_ENUM = ["male", "female", "other"];
exports.trainerSchema = new mongoose_1.Schema({
    fcmToken: { type: String, required: false, default: null },
    clientId: { type: String, required: true, unique: true },
    googleId: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: constants_1.ROLES, required: true },
    profileImage: { type: String },
    height: { type: Number },
    weight: { type: Number },
    dateOfBirth: { type: String },
    gender: { type: String, enum: exports.GENDER_ENUM },
    experience: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    specialization: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    approvalStatus: {
        type: String,
        enum: Object.values(constants_2.TrainerApprovalStatus),
        default: constants_2.TrainerApprovalStatus.PENDING,
    },
    rejectionReason: { type: String, required: false },
    approvedByAdmin: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    stripeConnectId: { type: String },
    clientCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    optOutBackupRole: { type: Boolean, default: false }, // NEW
    backupClientIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Client", default: [] }],
    maxBackupClients: { type: Number, default: 5 }, // NEW (optional)
}, {
    timestamps: true,
});
exports.trainerSchema.statics.updateFCMToken = function (clientId, fcmToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.updateOne({ clientId }, { fcmToken });
    });
};
exports.trainerSchema.index({ clientId: 1 }, { unique: true });
exports.trainerSchema.index({ specialization: 1, skills: 1, approvalStatus: 1, clientCount: 1 });
exports.trainerSchema.index({ backupClientIds: 1 });
exports.trainerSchema.index({ isOnline: 1 });
exports.trainerSchema.index({ experience: -1 });
exports.trainerSchema.index({ rating: -1, reviewCount: -1 });
