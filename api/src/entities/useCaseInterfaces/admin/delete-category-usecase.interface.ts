// entities/useCaseInterfaces/admin/delete-category-usecase.interface.ts
export interface IDeleteCategoryUseCase {
    execute(categoryId: string): Promise<void>;
  }