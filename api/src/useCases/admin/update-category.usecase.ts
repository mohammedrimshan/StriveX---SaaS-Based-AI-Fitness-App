import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { inject, injectable } from "tsyringe";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
  private _categoryRepository: ICategoryRepository;

  constructor(
    @inject("ICategoryRepository") categoryRepository: ICategoryRepository
  ) {
    this._categoryRepository = categoryRepository;
  }

  async execute(categoryId: string, title: string, metValue: number, description?: string): Promise<void> {
    // Check if the category with the new title already exists
    // const isCategoryExists = await this._categoryRepository.findByTitle(title);

    // if (isCategoryExists) {
    //   throw new CustomError("Category Exists", HTTP_STATUS.CONFLICT);
    // }

    // Update the category with the new title, metValue, and description
    await this._categoryRepository.updateCategory(categoryId, title, metValue, description);
  }
}
