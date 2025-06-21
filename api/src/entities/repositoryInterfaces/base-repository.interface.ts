import { ClientSession } from "mongoose";

export interface IBaseRepository<T> {
  save(data: Partial<T>,session?: ClientSession): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ items: T[] | []; total: number }>;
  count(filter: object): Promise<number>;
}
