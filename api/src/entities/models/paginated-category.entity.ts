import { ICategoryEntity } from "./category.entity";

export interface PaginatedCategories {
  categories: Pick<ICategoryEntity, "_id" | "title" | "status" | "description">[] | [];
  total: number;
  all: number;
}