import { inject, injectable } from "tsyringe";
import { ICategoryRepository } from "../../entities/repositoryInterfaces/common/category-repository.interface";
import { IGetAllCategoriesUseCase } from "@/entities/useCaseInterfaces/common/get-all-category.interface";
import { ICategoryEntity } from "../../entities/models/category.entity";

@injectable()
export class GetAllCategoriesUseCase implements IGetAllCategoriesUseCase {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(filter: any = {}, skip: number = 0, limit: number = 100): Promise<ICategoryEntity[]> {
    const { items } = await this.categoryRepository.find(filter, skip, limit);
    return items;
  }
  
}
