// useCases/admin/update-category.usecase.ts
import { IUpdateCategoryUseCase } from "@/entities/useCaseInterfaces/admin/update-category-usecase.interface";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
   private _categoryRepository:ICategoryRepository;

  constructor(
    @inject("ICategoryRepository") categoryRepository: ICategoryRepository
  ) {
    this._categoryRepository = categoryRepository;
  }

  async execute(categoryId: string, name: string, description?: string): Promise<void> {
    await this._categoryRepository.updateCategory(categoryId, name, description);
  }
}