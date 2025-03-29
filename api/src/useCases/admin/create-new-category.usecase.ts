import { inject, injectable } from "tsyringe";
import { ICategoryRepository } from "../../entities/repositoryInterfaces/common/category-repository.interface";
import { ICreateNewCategoryUseCase } from "@/entities/useCaseInterfaces/admin/create-new-category.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "../../shared/constants";
import { generateUniqueId } from "@/frameworks/security/uniqueuid.bcrypt";
@injectable()
export class CreateNewCategoryUseCase implements ICreateNewCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(title: string, description?: string): Promise<void> {
    const isCategoryExists = await this.categoryRepository.findByTitle(title);

    if (isCategoryExists) {
      throw new CustomError("Category Exists", HTTP_STATUS.CONFLICT);
    }

    const categoryId = generateUniqueId();
    await this.categoryRepository.save(title, categoryId, description);
  }
}