import { inject, injectable } from "tsyringe";
import { PaginatedCategories } from "../../entities/models/paginated-category.entity";
import { ICategoryRepository } from "../../entities/repositoryInterfaces/common/category-repository.interface"
import { IGetAllPaginatedCategoryUseCase } from "../../entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";

@injectable()
export class GetAllPaginatedCategoryUseCase implements IGetAllPaginatedCategoryUseCase {
  constructor(
    @inject("ICategoryRepository") private _categoryRepository: ICategoryRepository
  ) {}

  async execute(
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<PaginatedCategories> {
    let filter: any = {};


    if (searchTerm?.trim()) {
      filter.$or = [
        { title: { $regex: searchTerm.trim(), $options: "i" } },
        { description: { $regex: searchTerm.trim(), $options: "i" } }, 
      ];
    }

    const validPageNumber = Math.max(1, pageNumber || 1);
    const validPageSize = Math.max(1, pageSize || 5);
    const skip = (validPageNumber - 1) * validPageSize;
    const limit = validPageSize;

  
    console.log("Filter:", filter, "Skip:", skip, "Limit:", limit);

    const { categories, total, all } =
      await this._categoryRepository.findPaginatedCategory(filter, skip, limit);

    const response: PaginatedCategories = {
      categories,
      total: Math.ceil(total / validPageSize), 
      all: total, 
    };
    return response;
  }
}