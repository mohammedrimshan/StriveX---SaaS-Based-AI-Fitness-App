export interface ICreateNewCategoryUseCase {
  execute(title: string, metValue: number, description?: string): Promise<void>; 
}