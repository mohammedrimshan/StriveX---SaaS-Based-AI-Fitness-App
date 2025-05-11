import { inject, injectable } from "tsyringe";
import { ICategoryRepository } from "../../entities/repositoryInterfaces/common/category-repository.interface";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "../../shared/constants";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";

@injectable()
export class CreateNewCategoryUseCase implements ICreateNewCategoryUseCase {

  private _categoryRepository:ICategoryRepository;
  
  constructor(
    @inject("ICategoryRepository") categoryRepository:ICategoryRepository
  ) {
    this._categoryRepository = categoryRepository
  }

  async execute(title: string, metValue: number, description?: string ): Promise<void> {
    const isCategoryExists = await this._categoryRepository.findByTitle(title);

    if (isCategoryExists) {
      throw new CustomError("Category Exists", HTTP_STATUS.CONFLICT);
    }

    const categoryId = generateUniqueId();

    await this._categoryRepository.save({
      categoryId,
      title,
      metValue,
      description,
      status: true, 
    });
  }
}
