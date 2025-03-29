export interface ICreateNewCategoryUseCase {
  execute(title: string, description?: string): Promise<void>; 
}