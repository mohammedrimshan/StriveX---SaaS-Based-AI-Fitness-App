// useCases/admin/update-category.usecase.ts
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(categoryId: string, name: string, description?: string): Promise<void> {
    // Pass arguments separately as expected by the repository
    await this.categoryRepository.updateCategory(categoryId, name, description);
  }
}