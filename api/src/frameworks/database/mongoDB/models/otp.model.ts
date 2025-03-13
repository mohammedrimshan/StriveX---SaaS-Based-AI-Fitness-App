import { model, ObjectId } from "mongoose";
import { IOtpEntity } from "../../../../entities/models/otp.entity";
import { OtpSchema } from "../schemas/otp.schema";

export interface IOtpModel extends Omit<IOtpEntity, "id">, Document {
	_id: ObjectId;
}

export const OtpModel = model<IOtpModel>("Otp", OtpSchema);