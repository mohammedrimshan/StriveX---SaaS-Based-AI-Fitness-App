import { ICategoryEntity } from "../../models/category.entity";

export interface IGetAllCategoriesUseCase {
  execute(): Promise<ICategoryEntity[] | null>;
}
