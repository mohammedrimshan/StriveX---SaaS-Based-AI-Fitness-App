import { ICategoryEntity } from "../../models/category.entity";
import { PaginatedCategories } from "../../models/paginated-category.entity";
import { IBaseRepository } from "../base-repository.interface";
export interface ICategoryRepository extends IBaseRepository<ICategoryEntity> {
  find(filter: any, skip: number, limit: number): Promise<{ items: ICategoryEntity[] | []; total: number }>;
  findByTitle(title: string): Promise<ICategoryEntity | null>;

  findById(id: any): Promise<ICategoryEntity | null>;

  findPaginatedCategory(
    filter: any,
    skip: number,
    limit: number
  ): Promise<PaginatedCategories>;

  updateCategoryStatus(id: any): Promise<void>;

  updateCategory(
    id: any,
    title: string,
    description?: string
  ): Promise<ICategoryEntity>;
}
