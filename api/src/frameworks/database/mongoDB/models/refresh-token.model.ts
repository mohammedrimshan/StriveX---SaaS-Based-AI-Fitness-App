import { model, ObjectId } from "mongoose";
import { RefreshTokenSchema } from "../schemas/refresh-token.schema";
import { IRefreshTokenEntity } from "../../../../entities/models/refresh-token.entity";

export interface IRefreshTokenModel
	extends Omit<IRefreshTokenEntity, "id" | "user">,
		Document {
	_id: ObjectId;
	user: ObjectId;
}

export const RefreshTokenModel = model<IRefreshTokenModel>(
	"RefreshToken",
	RefreshTokenSchema
);