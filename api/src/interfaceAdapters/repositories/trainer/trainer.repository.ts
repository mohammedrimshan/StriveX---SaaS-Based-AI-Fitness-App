import { injectable } from "tsyringe";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { TrainerModel } from "@/frameworks/database/mongoDB/models/trainer.model";
import { SlotStatus, TrainerApprovalStatus } from "@/shared/constants";
import { BaseRepository } from "../base.repository";
import { IClientEntity } from "@/entities/models/client.entity";
import { SlotModel } from "@/frameworks/database/mongoDB/models/slot.model";
import { UpdateQuery } from "mongoose";
import { Types } from "mongoose";
@injectable()
export class TrainerRepository
  extends BaseRepository<ITrainerEntity>
  implements ITrainerRepository
{
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
    const trainer = await this.model
      .findOne({ $or: [{ _id: id }, { clientId: id }] })
      .lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ items: ITrainerEntity[] | []; total: number }> {
    const [trainers, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);
    const transformedTrainers = trainers.map((trainer) =>
      this.mapToEntity(trainer)
    );
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
    if (rejectionReason !== undefined)
      updateData.rejectionReason = rejectionReason;
    if (approvedByAdmin !== undefined)
      updateData.approvedByAdmin = approvedByAdmin;

    const trainer = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();
    if (!trainer) return null;
    return this.mapToEntity(trainer);
  }

  async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { password });
  }

  async findBackupTrainerForClient(
    excludedTrainerId: string,
    specialization: string
  ): Promise<ITrainerEntity | null> {
    return TrainerModel.findOne({
      _id: { $ne: excludedTrainerId },
      approvalStatus: TrainerApprovalStatus.APPROVED,
      isOnline: true,
      specialization: { $in: [specialization] },
    }).lean();
  }

  async addBackupClient(
    trainerId: string,
    clientId: string
  ): Promise<ITrainerEntity | null> {
    return this.findOneAndUpdateAndMap({ _id: trainerId }, {
      $addToSet: { backupClientIds: clientId },
    } as UpdateQuery<ITrainerEntity>);
  }

  async removeBackupClient(
    trainerId: string,
    clientId: string
  ): Promise<ITrainerEntity | null> {
    return this.findOneAndUpdateAndMap({ _id: trainerId }, {
      $pull: { backupClientIds: clientId },
    } as UpdateQuery<ITrainerEntity>);
  }

  async updateOptOutBackupRole(
    trainerId: string,
    optOut: boolean
  ): Promise<ITrainerEntity | null> {
    return this.findOneAndUpdateAndMap(
      { _id: trainerId },
      { optOutBackupRole: optOut }
    );
  }

async findAvailableBackupTrainers(
  clientPreferences: Partial<IClientEntity>,
  excludedTrainerIds: Types.ObjectId[]
): Promise<ITrainerEntity[]> {
  const preferredWorkout = clientPreferences.preferredWorkout || "";

  const filter = {
    approvalStatus: TrainerApprovalStatus.APPROVED,
    status: "active",
    optOutBackupRole: false,
    _id: { $nin: excludedTrainerIds },
    ...(preferredWorkout
      ? { specialization: { $in: [preferredWorkout] } }
      : {}),
    $expr: {
      $lt: [
        { $size: { $ifNull: ["$backupClientIds", []] } },
        { $ifNull: ["$maxBackupClients", 5] },
      ],
    },
  };

  const trainers = await this.model
    .find(filter)
    .sort({ experience: -1 })
    .limit(3)
    .lean();

  return trainers.map((trainer) => this.mapToEntity(trainer));
}


  async findTrainerWithBackupClients(trainerId: string): Promise<any | null> {
    return this.model
      .findById(trainerId)
      .populate({
        path: "backupClientIds",
        select: "firstName lastName profileImage clientId",
      })
      .lean();
  }

  async findAvailableTrainersBySkillsOrPreferredWorkout(
    date: string,
    startTime: string,
    endTime: string,
    clientSkills: string[],
    clientPreferredWorkout: string,
    excludedTrainerIds: string[]
  ): Promise<ITrainerEntity[]> {
    // Validate and convert excludedTrainerIds to ObjectId array
    const excludedIds = excludedTrainerIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    // Base query to filter trainers who are active, approved, not opted out of backup role, and have less than maxBackupClients
    const baseQuery: any = {
      approvalStatus: TrainerApprovalStatus.APPROVED,
      status: "active",
      optOutBackupRole: false,
      _id: { $nin: excludedIds },
      $expr: {
        $lt: [
          { $size: { $ifNull: ["$backupClientIds", []] } },
          "$maxBackupClients",
        ],
      },
    };

    // Add skill or preferredWorkout condition
    if (clientSkills.length > 0) {
      baseQuery.skills = { $in: clientSkills };
    } else if (clientPreferredWorkout) {
      baseQuery.specializations = clientPreferredWorkout;
      // if specializations is an array, this matches trainers where preferred workout is present inside specializations
      // if specializations is stored as array field, this works fine
    }

    // Find trainers matching criteria
    const trainers = await this.model.find(baseQuery).lean();

    const availableTrainers: ITrainerEntity[] = [];

    // Filter trainers by availability (no conflicting booked slots)
    for (const trainer of trainers) {
      const conflictingSlots = await SlotModel.find({
        trainerId: trainer._id,
        date,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
          },
        ],
        status: SlotStatus.BOOKED,
      }).lean();

      if (conflictingSlots.length === 0) {
        availableTrainers.push(this.mapToEntity(trainer));
      }
    }

    return availableTrainers;
  }
}
