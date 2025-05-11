
export interface IUpdateCategoryUseCase {
    execute(categoryId: string, title: string,metValue: number, description?: string): Promise<void>;
  }