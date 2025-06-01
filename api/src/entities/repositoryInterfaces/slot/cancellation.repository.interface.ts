import { ICancellationEntity } from "@/entities/models/cancellation.entity";

export interface ICancellationRepository {
  save(data: Partial<ICancellationEntity>): Promise<ICancellationEntity>;
  findById(id: string): Promise<ICancellationEntity | null>;
  findBySlotId(slotId: string): Promise<ICancellationEntity | null>;
  findByTrainerId(trainerId: string, date?: string): Promise<ICancellationEntity[]>;
}