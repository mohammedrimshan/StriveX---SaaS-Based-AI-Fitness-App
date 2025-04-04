import { injectable } from "tsyringe";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { TrainerModel } from "@/frameworks/database/mongoDB/models/trainer.model";
import { TrainerApprovalStatus } from "@/shared/constants";

@injectable()
export class TrainerRepository implements ITrainerRepository {
  async save(data: Partial<ITrainerEntity>): Promise<ITrainerEntity | null> {
    const trainer = await TrainerModel.create(data);
    if (!trainer) return null;

    return {
      ...trainer.toObject(),
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }

  async findByEmail(email: string): Promise<ITrainerEntity | null> {
    const trainer = await TrainerModel.findOne({ email }).lean();
    if (!trainer) return null;

    return {
      ...trainer,
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }

  async findById(id: string): Promise<ITrainerEntity | null> {
    const trainer = await TrainerModel.findById(id).lean();
    if (!trainer) return null;

    return {
      ...trainer,
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }

  async find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ trainers: ITrainerEntity[] | []; total: number }> {
    const [trainers, total] = await Promise.all([
      TrainerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TrainerModel.countDocuments(filter),
    ]);

    const transformedTrainers = trainers.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    return {
      trainers: transformedTrainers,
      total,
    };
  }

  async updateByEmail(
    email: string,
    updates: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null> {
    const trainer = await TrainerModel.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    ).lean();
    if (!trainer) return null;

    return {
      ...trainer,
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null> {
    const trainer = await TrainerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();
    if (!trainer) return null;

    return {
      ...trainer,
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }

  async updateApprovalStatus(
    id: string,
    status: TrainerApprovalStatus,
    rejectionReason?: string,
    approvedByAdmin?: boolean
  ): Promise<ITrainerEntity | null> {
    // Prepare the update object with all relevant fields
    const updateData: Partial<ITrainerEntity> = {
      approvalStatus: status,
    };

    // Include rejectionReason if provided (for rejections)
    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }

    // Include approvedByAdmin if provided (true for approvals, false for rejections)
    if (approvedByAdmin !== undefined) {
      updateData.approvedByAdmin = approvedByAdmin;
    }

    const trainer = await TrainerModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return the updated document
    ).lean();

    if (!trainer) return null;

    return {
      ...trainer,
      id: trainer._id.toString(),
    } as ITrainerEntity;
  }
  async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
          await TrainerModel.findByIdAndUpdate(id, { password });
        }
}