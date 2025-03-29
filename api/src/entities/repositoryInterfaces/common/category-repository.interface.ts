import { ICategoryEntity } from "../../models/category.entity";
import { PaginatedCategories } from "../../models/paginated-category.entity";

export interface ICategoryRepository {
  find(): Promise<ICategoryEntity[] | []>;

  save(title: string, categoryId: string, description?: string): Promise<ICategoryEntity>;

  findByTitle(title: string): Promise<ICategoryEntity | null>;

  findById(id: any): Promise<ICategoryEntity | null>;

  findPaginatedCategory(
    filter: any,
    skip: number,
    limit: number
  ): Promise<PaginatedCategories>;

  updateCategoryStatus(id: any): Promise<void>;

  updateCategory(id: any, title: string, description?: string): Promise<ICategoryEntity>;
  deleteCategory(id: any): Promise<void>;
}
