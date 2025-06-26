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
exports.clientSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.clientSchema = new mongoose_1.Schema({
    fcmToken: { type: String, required: false, default: null },
    clientId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: function () { return !this.googleId; } },
    password: { type: String, required: function () { return !this.googleId; } },
    role: { type: String, enum: constants_1.ROLES, required: true },
    preferredWorkout: { type: String, enum: constants_1.WORKOUT_TYPES, required: false },
    profileImage: { type: String },
    height: { type: Number, required: false },
    weight: { type: Number, required: false },
    status: { type: String, default: "active" },
    googleId: { type: String },
    fitnessGoal: { type: String, enum: constants_1.FITNESS_GOALS, required: false },
    experienceLevel: { type: String, enum: constants_1.EXPERIENCE_LEVELS, required: false },
    activityLevel: { type: String, enum: constants_1.ACTIVITY_LEVELS, required: false },
    healthConditions: {
        type: [String],
        required: false,
        validate: {
            validator: (value) => Array.isArray(value) && value.every((item) => typeof item === "string"),
            message: "healthConditions must be an array of strings",
        },
    },
    waterIntake: { type: Number, required: false },
    waterIntakeTarget: { type: Number, required: false, default: 2000 },
    dietPreference: { type: String, required: false },
    isPremium: { type: Boolean, default: false },
    membershipPlanId: { type: mongoose_1.Schema.Types.ObjectId, ref: "MembershipPlan" },
    subscriptionStartDate: { type: Date, required: false },
    subscriptionEndDate: { type: Date, required: false },
    sleepFrom: { type: String, required: false },
    wakeUpAt: { type: String, required: false },
    skillsToGain: { type: [String], enum: constants_1.SKILLS, required: true },
    selectionMode: { type: String, enum: ["auto", "manual"], required: false, default: "manual" },
    matchedTrainers: { type: [String], default: [] },
    selectedTrainerId: { type: String, required: false },
    selectStatus: { type: String, enum: Object.values(constants_1.TrainerSelectionStatus), default: constants_1.TrainerSelectionStatus.PENDING },
    isOnline: { type: Boolean, default: false },
    backupTrainerId: { type: String, required: false },
    previousTrainerId: { type: String, required: false },
    backupTrainerStatus: {
        type: String,
        enum: Object.values(constants_1.BackupInvitationStatus),
        required: false,
        default: constants_1.BackupInvitationStatus.PENDING,
    },
}, {
    timestamps: true,
});
exports.clientSchema.statics.updateFCMToken = function (clientId, fcmToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.updateOne({ clientId }, { fcmToken });
    });
};
exports.clientSchema.index({ clientId: 1 }, { unique: true });
exports.clientSchema.index({ selectedTrainerId: 1, selectStatus: 1 });
exports.clientSchema.index({ isOnline: 1 });
