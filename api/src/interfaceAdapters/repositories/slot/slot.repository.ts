import { injectable } from "tsyringe";
import { SlotModel } from "../../../frameworks/database/mongoDB/models/slot.model";
import { ISlotEntity } from "../../../entities/models/slot.entity";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { ISlotRepository } from "../../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { BaseRepository } from "../base.repository";
import { SlotStatus } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { Types } from "mongoose";
@injectable()
export class SlotRepository
  extends BaseRepository<ISlotEntity>
  implements ISlotRepository
{
  constructor() {
    super(SlotModel);
  }

  async findByTrainerId(
    trainerId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<ISlotEntity[]> {
    const filter: Record<string, unknown> = {
      trainerId,
      ...(startTime &&
        endTime && {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        }),
    };

    return (await this.model.find(filter).lean()).map(this.mapToEntity);
  }

  async findOverlappingSlots(
    trainerId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ISlotEntity[]> {
    const startDate = startTime.toISOString().split("T")[0];
    const filter = {
      trainerId,
      date: startDate,
      $or: [
        {
          startTime: {
            $lt: `${String(endTime.getHours()).padStart(2, "0")}:${String(
              endTime.getMinutes()
            ).padStart(2, "0")}`,
            $gte: `${String(startTime.getHours()).padStart(2, "0")}:${String(
              startTime.getMinutes()
            ).padStart(2, "0")}`,
          },
        },
        {
          endTime: {
            $gt: `${String(startTime.getHours()).padStart(2, "0")}:${String(
              startTime.getMinutes()
            ).padStart(2, "0")}`,
            $lte: `${String(endTime.getHours()).padStart(2, "0")}:${String(
              endTime.getMinutes()
            ).padStart(2, "0")}`,
          },
        },
        {
          startTime: {
            $lte: `${String(startTime.getHours()).padStart(2, "0")}:${String(
              startTime.getMinutes()
            ).padStart(2, "0")}`,
          },
          endTime: {
            $gte: `${String(endTime.getHours()).padStart(2, "0")}:${String(
              endTime.getMinutes()
            ).padStart(2, "0")}`,
          },
        },
      ],
    };

    return (await this.model.find(filter).lean()).map(this.mapToEntity);
  }

  async updateStatus(
    slotId: string,
    status: SlotStatus,
    clientId?: string,
    isBooked?: boolean,
    cancellationReason?: string
  ): Promise<ISlotEntity | null> {
    const slot = await this.findById(slotId);
  
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }
  
    const updates: Partial<ISlotEntity> = {
      status,
      isBooked: status === SlotStatus.BOOKED ? true : false,
      isAvailable: status === SlotStatus.AVAILABLE ? true : false,
      cancellationReason: status === SlotStatus.AVAILABLE ? cancellationReason : undefined,
    };
  
    updates.clientId = clientId !== undefined ? clientId : undefined; 
  
    if (status === SlotStatus.BOOKED && !clientId) {
      throw new CustomError(
        "Client ID required for booking a slot",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  
    console.log('updateStatus - slotId:', slotId, 'updates:', updates);
  
    return this.update(slotId, updates);
  }

  
  async findBookedSlotByClientId(
    clientId: string,
    slotId: string
  ): Promise<ISlotEntity | null> {
    const slot = await this.model
      .findOne({ _id: slotId, clientId, status: SlotStatus.BOOKED })
      .lean();

    return slot ? this.mapToEntity(slot) : null;
  }

  async findAnyBookedSlotByClientId(clientId: string): Promise<ISlotEntity | null> {
    const slot = await this.model.findOne({
      clientId,
      status: SlotStatus.BOOKED,
    }).lean();
  
    return slot ? this.mapToEntity(slot) : null;
  }
  

  async getSlotsWithStatus(
    trainerId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<
    Array<
      Omit<ISlotEntity, "id" | "startTime" | "endTime"> & {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        isBooked: boolean;
        isAvailable: boolean;
        trainerName: string;
        clientName: string;
        cancellationReason?: string;
      }
    >
  > {
    const matchStage: Record<string, unknown> = {
      trainerId: new Types.ObjectId(trainerId),
      ...(startTime &&
        endTime && {
          date: startTime.toISOString().split("T")[0],
          startTime: {
            $gte: `${String(startTime.getHours()).padStart(2, "0")}:${String(
              startTime.getMinutes()
            ).padStart(2, "0")}`,
          },
          endTime: {
            $lte: `${String(endTime.getHours()).padStart(2, "0")}:${String(
              endTime.getMinutes()
            ).padStart(2, "0")}`,
          },
        }),
    };

    const slots = await this.model
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "trainers",
            let: { trainerId: { $toObjectId: "$trainerId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$trainerId"] } } }],
            as: "trainerInfo",
          },
        },
        {
          $unwind: {
            path: "$trainerInfo",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "clients",
            let: { clientId: "$clientId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", { $toObjectId: "$$clientId" }] },
                },
              },
            ],
            as: "clientInfo",
          },
        },
        {
          $unwind: {
            path: "$clientInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            id: { $toString: "$_id" },
            date: "$date",
            startTime: "$startTime",
            endTime: "$endTime",
            isBooked: { $eq: ["$status", SlotStatus.BOOKED] },
            isAvailable: { $eq: ["$status", SlotStatus.AVAILABLE] },
            trainerName: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$trainerInfo", null] },
                    { $eq: ["$trainerInfo", {}] },
                    { $not: ["$trainerInfo.firstName"] },
                    { $not: ["$trainerInfo.lastName"] },
                  ],
                },
                then: "Unknown Trainer",
                else: {
                  $concat: [
                    "$trainerInfo.firstName",
                    " ",
                    "$trainerInfo.lastName",
                  ],
                },
              },
            },
            clientName: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$clientInfo", null] },
                    { $eq: ["$clientInfo", {}] },
                    { $not: ["$clientInfo.firstName"] },
                    { $not: ["$clientInfo.lastName"] },
                  ],
                },
                then: "Unknown Client",
                else: {
                  $concat: [
                    "$clientInfo.firstName",
                    " ",
                    "$clientInfo.lastName",
                  ],
                },
              },
            },
            cancellationReason: "$cancellationReason",
          },
        },
        {
          $project: {
            id: 1,
            trainerId: 1,
            trainerName: 1,
            clientId: 1,
            clientName: 1,
            date: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            isBooked: 1,
            isAvailable: 1,
            cancellationReason: 1,
          },
        },
      ])
      .exec();
    console.log(slots, "slots");
    return slots;
  }

  async findTrainerSlotsByClientId(
    userClientId: string
  ): Promise<ISlotEntity[]> {
    const client = await ClientModel.findOne({ clientId: userClientId }).lean();
    if (!client || !client.selectedTrainerId) {
      return [];
    }

    const slots = await this.model
      .find({ trainerId: client.selectedTrainerId })
      .lean();

    return slots.map(this.mapToEntity);
  }

  async findBookedSlotsByClientId(clientId: string): Promise<
    Array<
      Omit<ISlotEntity, "id" | "startTime" | "endTime"> & {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        isBooked: boolean;
        isAvailable: boolean;
        trainerName: string;
        clientName: string;
        cancellationReason?: string;
      }
    >
  > {
    if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
      console.error("findBookedSlotsByClientId - Invalid clientId:", clientId);
      throw new CustomError(
        "Valid Client ID is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const matchStage: Record<string, unknown> = {
      clientId: { $eq: clientId },
      status: SlotStatus.BOOKED,
    };

    console.log("findBookedSlotsByClientId - matchStage:", matchStage);

    const slots = await this.model
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "trainers",
            let: { trainerId: "$trainerId" },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$trainerId"] } } }],
            as: "trainerInfo",
          },
        },
        {
          $unwind: {
            path: "$trainerInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "clients",
            let: { clientId: "$clientId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", { $toObjectId: "$$clientId" }] },
                },
              },
            ],
            as: "clientInfo",
          },
        },
        {
          $unwind: {
            path: "$clientInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $set: {
            id: { $toString: "$_id" },
            date: "$date",
            startTime: "$startTime",
            endTime: "$endTime",
            isBooked: { $eq: ["$status", SlotStatus.BOOKED] },
            isAvailable: { $eq: ["$status", SlotStatus.AVAILABLE] },
            trainerName: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$trainerInfo", null] },
                    { $eq: ["$trainerInfo", {}] },
                    { $not: ["$trainerInfo.firstName"] },
                    { $not: ["$trainerInfo.lastName"] },
                  ],
                },
                then: "Unknown Trainer",
                else: {
                  $concat: [
                    "$trainerInfo.firstName",
                    " ",
                    "$trainerInfo.lastName",
                  ],
                },
              },
            },
            clientName: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$clientInfo", null] },
                    { $eq: ["$clientInfo", {}] },
                    { $not: ["$clientInfo.firstName"] },
                    { $not: ["$clientInfo.lastName"] },
                  ],
                },
                then: "Unknown Client",
                else: {
                  $concat: [
                    "$clientInfo.firstName",
                    " ",
                    "$clientInfo.lastName",
                  ],
                },
              },
            },
            cancellationReason: "$cancellationReason",
          },
        },
        {
          $project: {
            id: 1,
            trainerId: 1,
            trainerName: 1,
            clientId: 1,
            clientName: 1,
            date: 1,
            startTime: 1,
            endTime: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            isBooked: 1,
            isAvailable: 1,
            cancellationReason: 1,
          },
        },
      ])
      .exec();

    console.log("findBookedSlotsByClientId - raw slots:", slots);
    return slots;
  }
}
