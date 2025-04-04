// api\src\frameworks\database\mongoDB\models\user-workout-preference.model.ts
import { model, Document, ObjectId } from "mongoose";
import { IUserWorkoutPreference } from "@/entities/models/user-workout-preference.entity";
import { UserWorkoutPreferenceSchema } from "../schemas/user-workout-preference.schema";

export interface IUserWorkoutPreferenceModel extends Omit<IUserWorkoutPreference, "_id">, Document {
  _id: ObjectId;
}

export const UserWorkoutPreferenceModel = model<IUserWorkoutPreference>("UserWorkoutPreference", UserWorkoutPreferenceSchema);