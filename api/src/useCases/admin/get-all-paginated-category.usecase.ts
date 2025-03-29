import { inject, injectable } from "tsyringe";
import { PaginatedCategories } from "../../entities/models/paginated-category.entity";
import { ICategoryRepository } from "../../entities/repositoryInterfaces/common/category-repository.interface";
import { IGetAllPaginatedCategoryUseCase } from "../../entities/useCaseInterfaces/admin/get-all-paginated-category-usecase.interface";

@injectable()
export class GetAllPaginatedCategoryUseCase
  implements IGetAllPaginatedCategoryUseCase
{
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}
  async execute(
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<PaginatedCategories> {
    let filter: any = {};

    if (searchTerm?.trim()) {
      filter.title = { $regex: searchTerm.trim(), $options: "i" };
    }

    const validPageNumber = Math.max(1, pageNumber || 1);
    const validPageSize = Math.max(1, pageSize || 10);
    const skip = (validPageNumber - 1) * validPageSize;
    const limit = validPageSize;

    const { categories, total, all } =
      await this.categoryRepository.findPaginatedCategory(filter, skip, limit);

    const response: PaginatedCategories = {
      categories,
      total: Math.ceil(total / validPageSize),
      all,
    };

    return response;
  }
}
