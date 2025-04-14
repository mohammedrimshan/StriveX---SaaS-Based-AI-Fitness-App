
export interface IUpdateCategoryUseCase {
    execute(categoryId: string, title: string, description?: string): Promise<void>;
  }