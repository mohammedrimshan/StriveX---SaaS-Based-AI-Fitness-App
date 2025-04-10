import { injectable } from "tsyringe";
import { ICategoryRepository } from "@/entities/repositoryInterfaces/common/category-repository.interface";
import { CategoryModel } from "@/frameworks/database/mongoDB/models/category.model";
import { ICategoryEntity } from "@/entities/models/category.entity";
import { PaginatedCategories } from "@/entities/models/paginated-category.entity";
import { BaseRepository } from "../base.repository";
import mongoose from "mongoose"; 
import { CustomError } from "@/entities/utils/custom.error"; 
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class CategoryRepository extends BaseRepository<ICategoryEntity> implements ICategoryRepository {
  constructor() {
    super(CategoryModel);
  }

  async find(filter: any, skip: number, limit: number): Promise<{ items: ICategoryEntity[] | []; total: number }> {
    const [items, total] = await Promise.all([
      this.model.find({ ...filter, status: true }).skip(skip).limit(limit).lean(),
      this.model.countDocuments({ ...filter, status: true }),
    ]);
    const mappedItems = items.map((cat) => this.mapToEntity(cat));
    return { items: mappedItems, total };
  }

  async findByTitle(title: string): Promise<ICategoryEntity | null> {
    return await CategoryModel.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });
  }

  async findById(id: any): Promise<ICategoryEntity | null> {
    return await CategoryModel.findById(id);
  }

  async findPaginatedCategory(
    filter: any,
    skip: number,
    limit: number
  ): Promise<PaginatedCategories> {
    const [categories, total, all] = await Promise.all([
      CategoryModel.find(filter)
        .select("status title _id description") // Added description
        .skip(skip)
        .limit(limit),
      CategoryModel.countDocuments(filter),
      CategoryModel.countDocuments(),
    ]);

    return {
      categories,
      total,
      all,
    };
  }

  async updateCategoryStatus(id: any): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid Category ID format", HTTP_STATUS.BAD_REQUEST);
    }
    const result = await CategoryModel.findByIdAndUpdate(id, [
      { $set: { status: { $not: "$status" } } },
    ]);
    if (!result) {
      throw new CustomError("Category not found", HTTP_STATUS.NOT_FOUND);
    }
  }

  async updateCategory(id: any, title: string, description?: string): Promise<ICategoryEntity> {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          description: description !== undefined ? description : undefined,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true, runValidators: true }
    );
  
    if (!updatedCategory) {
      throw new Error(`Category with ID ${id} not found`);
    }
  
    return updatedCategory;
  }
  async deleteCategory(id: any): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid Category ID format", HTTP_STATUS.BAD_REQUEST);
    }
    const result = await CategoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new CustomError("Category not found", HTTP_STATUS.NOT_FOUND);
    }
  }
}