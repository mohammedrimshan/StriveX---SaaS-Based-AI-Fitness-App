import { IClientEntity } from "./client.entity";

export interface PaginatedUsers {
	user: IClientEntity[] |  [];
	total: number;
}
