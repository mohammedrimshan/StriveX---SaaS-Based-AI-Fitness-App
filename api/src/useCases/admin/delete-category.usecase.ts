// useCases/admin/DeleteCategoryUseCase.ts
import { IDeleteCategoryUseCase } from "@/entities/useCaseInterfaces/admin/delete-category-usecase.interface";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { inject, injectable } from "tsyringe";

@injectable()
export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(categoryId: string): Promise<void> {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    await this.categoryRepository.deleteCategory(categoryId);
  }
}