// useCases/admin/DeleteCategoryUseCase.ts
import { IDeleteCategoryUseCase } from "@/entities/useCaseInterfaces/admin/delete-category-usecase.interface";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {

  private _categoryRepository:ICategoryRepository;

  constructor(
    @inject("ICategoryRepository") categoryRepository: ICategoryRepository
  ) {
    this._categoryRepository = categoryRepository
  }

  async execute(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const category = await this._categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    await this._categoryRepository.deleteCategory(categoryId);
  }
}