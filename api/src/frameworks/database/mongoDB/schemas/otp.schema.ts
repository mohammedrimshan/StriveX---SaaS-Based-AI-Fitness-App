import { Schema } from "mongoose";
import { IOtpModel } from "../models/otp.model";

export const OtpSchema = new Schema<IOtpModel>(
	{
		otp: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expires: 60 },
		},
	},
	{ timestamps: true }
);
