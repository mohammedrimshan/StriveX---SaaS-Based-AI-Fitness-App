import { Schema } from "mongoose";
import { ITrainerModel } from "../models/trainer.model";
import { ROLES } from "@/shared/constants";

export const trainerSchema = new Schema<ITrainerModel>(
	{
        clientId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ROLES, required: true },
        profileImage: { type: String },
        height: { type: Number },
        weight: { type: Number },
        status: { type: String, default: "active" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        approvalStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"], // Use TypeScript type values
          default: "pending",
        },
        experience: { type: Number, default: 0 },
        certifications: { type: [String], default: [] },
        specialization: { type: [String], default: [] },
      },
      { 
        timestamps: true,
       }
    );