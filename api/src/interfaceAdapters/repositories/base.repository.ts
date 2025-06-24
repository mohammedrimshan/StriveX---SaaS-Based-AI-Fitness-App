import { injectable } from "tsyringe";
import { ClientSession, Model, QueryOptions } from "mongoose";
import { IBaseRepository } from "@/entities/repositoryInterfaces/base-repository.interface";

@injectable()
export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: Model<any>) {}

   async save(data: Partial<T>, session?: ClientSession): Promise<T> {
    try {
      const entity = new this.model(data);
      const savedEntity = await entity.save({ session });
      console.log(`[${new Date().toISOString()}] Saved entity to ${this.model.modelName}: ${entity._id}`);
      return this.mapToEntity(savedEntity.toObject());
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error saving entity to ${this.model.modelName}: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.model.findById(id).lean();
    if (!entity) return null;
    return this.mapToEntity(entity);
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const entity = await this.model
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .lean();
    if (!entity) return null;
    return this.mapToEntity(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ items: T[] | []; total: number }> {
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .select('-password')  
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    const transformedItems = items.map((item) => this.mapToEntity(item));
    return { items: transformedItems, total };
  }

  protected async findOneAndMap(filter: any): Promise<T | null> {
    const doc = await this.model.findOne(filter).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  protected async findOneAndUpdateAndMap(
  filter: any,
  update: any, 
  options: QueryOptions = { new: true }
): Promise<T | null> {
  const doc = await this.model
    .findOneAndUpdate(filter, update, options) 
    .lean();

  return doc ? this.mapToEntity(doc) : null;
}


  async count(filter: object): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async updateRaw(id: string, update: any): Promise<T | null> {
  const entity = await this.model
    .findByIdAndUpdate(id, update, { new: true })
    .lean();
  return entity ? this.mapToEntity(entity) : null;
}


  protected mapToEntity(doc: any): T {
    const { _id, __v, category, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      category: category?.title || category || undefined,
    } as T;
  }
}
