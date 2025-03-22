import { Schema } from "mongoose";
import { IClientModel } from "../models/client.model";
import { ROLES } from "@/shared/constants";

export const clientSchema = new Schema<IClientModel>(
    {
      clientId: { type: String, required: true },
      googleId: { type: String },
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
    },
    {
      timestamps: true,
    }
  );
  