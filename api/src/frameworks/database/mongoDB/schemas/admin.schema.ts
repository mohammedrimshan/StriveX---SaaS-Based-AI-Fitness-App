import { ROLES } from "@/shared/constants";
import { Schema } from "mongoose";

export const adminSchema = new Schema(
	{
		fcmToken: { type: String, required: false, default: null },
		clientId: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ROLES, required: true },
		isAdmin: { type: Boolean, default: false },
		profileImage: { type: String },
		status: { type: String, default: "active" },
	},
	{
		timestamps: true,
	}
);
