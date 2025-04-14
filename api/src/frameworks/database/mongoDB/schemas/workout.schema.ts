
import { Schema, Types } from "mongoose";
import { IWorkoutEntity } from "@/entities/models/workout.entity";
import { IWorkoutModel } from "../models/workout.model";
const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, 
  videoUrl:{type:String,required:true},
  defaultRestDuration: { type: Number, required: true }, 
});

export const WorkoutSchema = new Schema<IWorkoutModel>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  duration: { type: Number, required: true }, 
  difficulty: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  imageUrl: { type: String },
  exercises: [ExerciseSchema],
  isPremium: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
}, { timestamps: true });