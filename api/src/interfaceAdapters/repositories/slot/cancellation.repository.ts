import { injectable } from "tsyringe";
import { CancellationModel, ICancellationModel } from "@/frameworks/database/mongoDB/models/cancellation.model";
import { ICancellationEntity } from "@/entities/models/cancellation.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { Types } from "mongoose";
import { BaseRepository } from "../base.repository";
import { ICancellationRepository } from "@/entities/repositoryInterfaces/slot/cancellation.repository.interface";
@injectable()
export class CancellationRepository
  extends BaseRepository<ICancellationEntity>
  implements ICancellationRepository
{
  constructor() {
    super(CancellationModel);
  }

  protected mapToEntity(doc: any): ICancellationEntity {
    return {
      id: doc._id?.toString(),
      slotId: doc.slotId?.toString(),
      clientId: doc.clientId?._id?.toString() || doc.clientId,
      trainerId: doc.trainerId?._id?.toString() || doc.trainerId,
      cancellationReason: doc.cancellationReason,
      cancelledAt: doc.cancelledAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async save(data: Partial<ICancellationEntity>): Promise<ICancellationEntity> {
    if (!data.slotId || !data.clientId || !data.trainerId || !data.cancellationReason) {
      throw new CustomError(
        "Slot ID, Client ID, Trainer ID, and cancellation reason are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!Types.ObjectId.isValid(data.slotId) || !Types.ObjectId.isValid(data.clientId) || !Types.ObjectId.isValid(data.trainerId)) {
      throw new CustomError(
        "Invalid Slot ID, Client ID, or Trainer ID",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const cancellationData = {
      slotId: data.slotId,
      clientId: data.clientId,
      trainerId: data.trainerId,
      cancellationReason: data.cancellationReason,
      cancelledAt: data.cancelledAt || new Date(),
    };

    return super.save(cancellationData);
  }

  async findById(id: string): Promise<ICancellationEntity | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid cancellation ID", HTTP_STATUS.BAD_REQUEST);
    }

    const cancellation = await this.model
      .findById(id)
      .populate("clientId", "clientId firstName lastName email profileImage")
      .populate("trainerId", "clientId firstName lastName email profileImage")
      .lean();
    return cancellation ? this.mapToEntity(cancellation) : null;
  }

  async findBySlotId(slotId: string): Promise<ICancellationEntity | null> {
    if (!Types.ObjectId.isValid(slotId)) {
      throw new CustomError("Invalid slot ID", HTTP_STATUS.BAD_REQUEST);
    }

    const cancellation = await this.model
      .findOne({ slotId })
      .populate("clientId", "clientId firstName lastName email profileImage")
      .populate("trainerId", "clientId firstName lastName email profileImage")
      .lean();
    return cancellation ? this.mapToEntity(cancellation) : null;
  }

  async findByTrainerId(trainerId: string, date?: string): Promise<ICancellationEntity[]> {
    if (!Types.ObjectId.isValid(trainerId)) {
      throw new CustomError("Invalid trainer ID", HTTP_STATUS.BAD_REQUEST);
    }

    const filter: any = { trainerId: new Types.ObjectId(trainerId) };
    if (date) {
      if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new CustomError("Date must be in YYYY-MM-DD format", HTTP_STATUS.BAD_REQUEST);
      }
      filter.cancelledAt = {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lte: new Date(`${date}T23:59:59.999Z`),
      };
    }

    const cancellations = await this.model
      .find(filter)
      .populate("clientId", "clientId firstName lastName email profileImage")
      .populate("trainerId", "clientId firstName lastName email profileImage")
      .lean();
    return cancellations.map((item) => this.mapToEntity(item));
  }
}