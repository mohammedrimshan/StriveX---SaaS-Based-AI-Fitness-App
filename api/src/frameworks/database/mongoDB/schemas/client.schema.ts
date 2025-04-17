import { Schema } from "mongoose";
import { IClientModel } from "../models/client.model";
import { ROLES,FITNESS_GOALS,EXPERIENCE_LEVELS,ACTIVITY_LEVELS } from "@/shared/constants";

export const clientSchema = new Schema<IClientModel>(
  {
    clientId: { type: String, required: true,unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: function () { return !this.googleId; } },
    password: { type: String, required: function () { return !this.googleId; } },
    role: { type: String, enum: ROLES, required: true },
    profileImage: { type: String },
    height: { type: Number, required: false },
    weight: { type: Number, required: false },
    status: { type: String, default: "active" },
    googleId: { type: String },
    fitnessGoal: { type: String, enum: FITNESS_GOALS, required: false },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, required: false },
    activityLevel: { type: String, enum: ACTIVITY_LEVELS, required: false }, 
    healthConditions: {
      type: [String],
      required: false,
      validate: {
        validator: (value: any) => Array.isArray(value) && value.every((item) => typeof item === "string"),
        message: "healthConditions must be an array of strings",
      },
    },
    waterIntake: { type: Number, required: false },
    dietPreference: { type: String, required: false },
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true, 
  }
);