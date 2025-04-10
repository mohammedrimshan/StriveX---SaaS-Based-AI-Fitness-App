// api\src\interfaceAdapters\repositories\trainer\trainer.repository.ts
import { injectable } from "tsyringe";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { TrainerModel } from "@/frameworks/database/mongoDB/models/trainer.model";
import { TrainerApprovalStatus } from "@/shared/constants";
import { BaseRepository } from "../base.repository";
@injectable()
export class TrainerRepository extends BaseRepository<ITrainerEntity> implements ITrainerRepository {
  constructor() {
    super(TrainerModel);
  }

  async save(data: Partial<ITrainerEntity>): Promise<ITrainerEntity> {
    const trainer = await this.model.create(data);
    return this.mapToEntity(trainer.toObject());
  }

  async findByEmail(email: string): Promise<ITrainerEntity | null> {
    const trainer = await this.model.findOne({ email }).lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async findById(id: string): Promise<ITrainerEntity | null> {
    const trainer = await this.model.findById(id).lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ items: ITrainerEntity[] | []; total: number }> {
    const [trainers, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    const transformedTrainers = trainers.map((trainer) => this.mapToEntity(trainer));
    return { items: transformedTrainers, total };
  }

  async updateByEmail(
    email: string,
    updates: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null> {
    const trainer = await this.model
      .findOneAndUpdate({ email }, { $set: updates }, { new: true })
      .lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null> {
    const trainer = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async updateApprovalStatus(
    id: string,
    status: TrainerApprovalStatus,
    rejectionReason?: string,
    approvedByAdmin?: boolean
  ): Promise<ITrainerEntity | null> {
    const updateData: Partial<ITrainerEntity> = { approvalStatus: status };
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
    if (approvedByAdmin !== undefined) updateData.approvedByAdmin = approvedByAdmin;

    const trainer = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { password });
  }
}