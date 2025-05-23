import { Schema } from "mongoose";
import { ITrainerModel } from "../models/trainer.model";
import { ROLES } from "@/shared/constants";
import { TrainerApprovalStatus } from "@/shared/constants";
export const GENDER_ENUM = ["male", "female", "other"];

export const trainerSchema = new Schema<ITrainerModel>(
  {
    clientId: { type: String, required: true, unique: true },
    googleId: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    profileImage: { type: String },
    height: { type: Number },
    weight: { type: Number },
    dateOfBirth: { type: String },
    gender: { type: String, enum: GENDER_ENUM },
    experience: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    specialization: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    approvalStatus: {
      type: String,
      enum: Object.values(TrainerApprovalStatus),
      default: TrainerApprovalStatus.PENDING,
    },
    rejectionReason: { type: String, required: false },
    approvedByAdmin: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    stripeConnectId: { type: String },
    clientCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

trainerSchema.index({ clientId: 1 }, { unique: true });
trainerSchema.index({ specialization: 1, skills: 1, approvalStatus: 1, clientCount: 1 });
trainerSchema.index({ isOnline: 1 });