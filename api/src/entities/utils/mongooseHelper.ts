import mongoose, { model } from "mongoose";

export function getOrCreateModel<T extends Document>(
  name: string,
  schema: mongoose.Schema<T>
): mongoose.Model<T> {
  return (mongoose.models[name] as mongoose.Model<T>) || model<T>(name, schema);
}
