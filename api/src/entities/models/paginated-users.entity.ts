import { IClientEntity } from "./client.entity";
import { ITrainerEntity } from "./trainer.entity";
export interface PaginatedUsers {
	user: IClientEntity[] | ITrainerEntity[] |  [];
	total: number;
}
