
export interface IUpdateCategoryUseCase {
    execute(categoryId: string, name: string, description?: string): Promise<void>;
  }