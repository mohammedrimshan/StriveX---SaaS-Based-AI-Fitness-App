import { IClientEntity } from "./client.entity";
import { ITrainerEntity } from "./trainer.entity";
export interface PaginatedUsers<T = IClientEntity | ITrainerEntity> {
	user: any[];
	total: number;
  }
  