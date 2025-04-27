// api/src/interfaceAdapters/repositories/common/base.repository.ts
import { injectable } from "tsyringe";
import { Model } from "mongoose";
import { IBaseRepository } from "@/entities/repositoryInterfaces/base-repository.interface";

@injectable()
export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: Model<any>) {}

  async save(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    const savedEntity = await entity.save();
    return this.mapToEntity(savedEntity.toObject());
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
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
    updates: Partial<T>
  ): Promise<T | null> {
    const doc = await this.model.findOneAndUpdate(filter, { $set: updates }, { new: true }).lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  protected mapToEntity(doc: any): T {
    const { _id, __v, category, ...rest } = doc;
    return {
      ...rest,
      id: _id?.toString(),
      category: category?.title || category?.toString(),
    } as T;
  }
}
