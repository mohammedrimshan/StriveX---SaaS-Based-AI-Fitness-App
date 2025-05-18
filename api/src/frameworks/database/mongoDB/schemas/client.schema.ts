import { Schema } from "mongoose";
import { IClientModel } from "../models/client.model";
import { ROLES, FITNESS_GOALS, WORKOUT_TYPES,EXPERIENCE_LEVELS, ACTIVITY_LEVELS, SKILLS, TrainerSelectionStatus } from "@/shared/constants";

export const clientSchema = new Schema<IClientModel>(
  {
    fcmToken: { type: String, required: false, default: null },
    clientId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: function () { return !this.googleId; } },
    password: { type: String, required: function () { return !this.googleId; } },
    role: { type: String, enum: ROLES, required: true },
    preferredWorkout:{type:String,enum:WORKOUT_TYPES,required:false},
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
    sleepFrom: { type: String, required: false }, 
    wakeUpAt: { type: String, required: false }, 
    skillsToGain: { type: [String], enum: SKILLS, required: true },
    selectionMode: { type: String, enum: ["auto", "manual"], required: false, default: "manual" }, 
    matchedTrainers: { type: [String], default: [] },
    selectedTrainerId: { type: String, required: false },
    selectStatus: { type: String, enum: Object.values(TrainerSelectionStatus), default: TrainerSelectionStatus.PENDING },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

clientSchema.statics.updateFCMToken = async function (clientId: string, fcmToken: string): Promise<void> {
  await this.updateOne({ clientId }, { fcmToken });
}

clientSchema.index({ clientId: 1 }, { unique: true });
clientSchema.index({ selectedTrainerId: 1, selectStatus: 1 });
clientSchema.index({ isOnline: 1 });