import { IAdminEntity } from "@/entities/models/admin.entity";
import { Document, model, ObjectId } from "mongoose";
import { adminSchema } from "../schemas/admin.schema";

export interface IAdminModel extends Omit<IAdminEntity, "id">, Document {
	_id: ObjectId;
}

export const AdminModel = model<IAdminModel>("Admin", adminSchema);