import { inject, injectable } from "tsyringe";
import { SlotModel } from "../../../frameworks/database/mongoDB/models/slot.model";
import { ISlotEntity } from "../../../entities/models/slot.entity";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { ISlotRepository } from "../../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { BaseRepository } from "../base.repository";
import { PaymentStatus, SlotStatus, VideoCallStatus } from "@/shared/constants";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { Types } from "mongoose";
import { CancellationModel } from "@/frameworks/database/mongoDB/models/cancellation.model";
import { ClientInfoDTO } from "@/shared/dto/user.dto";
import { TrainerModel } from "@/frameworks/database/mongoDB/models/trainer.model";
import {
  ISessionHistoryModel,
  SessionHistoryModel,
} from "@/frameworks/database/mongoDB/models/session-history.model";
import { ITrainerEarningsRepository } from "@/entities/repositoryInterfaces/trainer/trainer-earnings.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IMembershipPlanRepository } from "@/entities/repositoryInterfaces/Stripe/membership-plan-repository.interface";
import { ITrainerEarningsEntity } from "@/entities/models/trainer-earnings.entity";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import mongoose from "mongoose";

@injectable()
export class SlotRepository
  extends BaseRepository<ISlotEntity>
  implements ISlotRepository
{
  constructor(
    @inject("IMembershipPlanRepository")
    private membershipPlanRepository: IMembershipPlanRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerEarningsRepository")
    private trainerEarningsRepository: ITrainerEarningsRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository
  ) {
    super(SlotModel);
  }

  private async saveToSessionHistory(
    slot: ISlotEntity,
    session?: any
  ): Promise<void> {
    const existingHistory = await SessionHistoryModel.findOne({
      trainerId: slot.trainerId,
      clientId: slot.clientId,
      date: slot.date,
      startTime: slot.startTime,
    }).session(session);

    if (existingHistory) {
      console.log(`Session history already exists for slot ${slot.id}`);
      return;
    }

    const trainer = await TrainerModel.findById(slot.trainerId)
      .select("firstName lastName")
      .lean()
      .session(session);
    const client = slot.clientId
      ? await ClientModel.findById(slot.clientId)
          .select("firstName lastName")
          .lean()
          .session(session)
      : null;

    const sessionHistoryData: Partial<ISessionHistoryModel> = {
      trainerId: slot.trainerId,
      trainerName: trainer
        ? `${trainer.firstName} ${trainer.lastName}`
        : slot.trainerName || "Unknown Trainer",
      clientId: slot.clientId,
      clientName: client
        ? `${client.firstName} ${client.lastName}`
        : slot.clientName || "Unknown Client",
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      videoCallStatus: slot.videoCallStatus,
      bookedAt: slot.bookedAt,
      cancellationReason: slot.cancellationReason,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    };

    await SessionHistoryModel.create([sessionHistoryData], { session });
    console.log(
      `Session history saved for slot ${slot.id} with videoCallStatus: ${slot.videoCallStatus}`
    );
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
      bookedAt: status === SlotStatus.BOOKED ? new Date() : undefined,
      cancellationReason:
        status === SlotStatus.AVAILABLE ? cancellationReason : undefined,
    };

    updates.clientId = clientId !== undefined ? clientId : undefined;

    if (status === SlotStatus.BOOKED && !clientId) {
      throw new CustomError(
        "Client ID required for booking a slot",
        HTTP_STATUS.BAD_REQUEST
      );
    }

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

  async findBookedSlotByClientIdAndDate(
    clientId: string,
    date: string
  ): Promise<ISlotEntity | null> {
    const slot = await this.model
      .findOne({
        clientId,
        date,
        status: SlotStatus.BOOKED,
      })
      .lean();

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
      throw new CustomError(
        "Valid Client ID is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const matchStage: Record<string, unknown> = {
      clientId: { $eq: clientId },
      status: SlotStatus.BOOKED,
    };

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

    return slots;
  }

  async updateVideoCallStatus(
    slotId: string,
    videoCallStatus: VideoCallStatus,
    videoCallRoomName?: string,
    videoCallJwt?: string
  ): Promise<ISlotEntity | null> {
    const updates: Partial<ISlotEntity> = { videoCallStatus };
    if (videoCallRoomName) {
      updates.videoCallRoomName = videoCallRoomName;
    }
    if (videoCallJwt) {
      updates.videoCallJwt = videoCallJwt;
    }
    console.log("updateVideoCallStatus - Applying updates:", {
      slotId,
      videoCallStatus,
      videoCallRoomName,
      videoCallJwt,
    });
    const updatedSlot = await this.update(slotId, updates);

    return updatedSlot;
  }
  async findByRoomName(roomName: string): Promise<ISlotEntity | null> {
    const slot = await this.model
      .findOne({ videoCallRoomName: roomName })
      .lean();
    return slot ? this.mapToEntity(slot) : null;
  }

  async findSlotsWithClients(
    trainerId: string
  ): Promise<
    (ISlotEntity & { client?: ClientInfoDTO; cancellationReasons?: string[] })[]
  > {
    const slots = await SlotModel.find({
      trainerId: new Types.ObjectId(trainerId),
    }).lean();

    const clientIds = slots
      .filter((slot) => slot.clientId)
      .map((slot) => slot.clientId!);
    const slotIds = slots.map((slot) => slot._id);

    const clients = await ClientModel.find({ _id: { $in: clientIds } })
      .select("_id firstName lastName email profileImage")
      .lean();

    const trainer = await TrainerModel.findById(trainerId)
      .select("firstName lastName")
      .lean();

    const cancellations = await CancellationModel.find({
      slotId: { $in: slotIds },
    })
      .select("slotId cancellationReason")
      .lean();

    const cancellationsMap = cancellations.reduce((acc, cancel) => {
      const slotIdStr = cancel.slotId.toString();
      if (!acc[slotIdStr]) acc[slotIdStr] = [];
      acc[slotIdStr].push(cancel.cancellationReason);
      return acc;
    }, {} as Record<string, string[]>);

    return slots.map((slot) => {
      const client = slot.clientId
        ? clients.find((c) => c._id.toString() === slot.clientId?.toString())
        : undefined;

      return {
        ...slot,
        id: slot._id.toString(),
        trainerName: trainer
          ? `${trainer.firstName} ${trainer.lastName}`
          : "Unknown Trainer",
        client: client
          ? {
              clientId: client._id.toString(),
              firstName: client.firstName,
              lastName: client.lastName,
              email: client.email,
              profileImage: client.profileImage,
            }
          : undefined,
        cancellationReasons: cancellationsMap[slot._id.toString()] ?? undefined,
      };
    });
  }
  async endVideoCall(slotId: string): Promise<ISlotEntity | null> {
    const slot = await SlotModel.findById(slotId).lean();
    if (!slot) {
      throw new CustomError("Slot not found", HTTP_STATUS.NOT_FOUND);
    }

    const updatedSlot = await SlotModel.findByIdAndUpdate(
      slotId,
      {
        videoCallStatus: VideoCallStatus.ENDED,
        videoCallRoomName: null,
        videoCallJwt: null,
      },
      { new: true }
    ).lean();

    if (!updatedSlot) {
      throw new CustomError(
        "Failed to update slot",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    if (updatedSlot.status === SlotStatus.BOOKED) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await this.saveToSessionHistory(this.mapToEntity(updatedSlot));
        console.log(`Session history saved for slot ${slotId}`);

        const client = await this.clientRepository.findByClientNewId(
          slot.clientId!
        );
        if (!client || !client.membershipPlanId) {
          throw new CustomError(
            "Client or membership plan not found",
            HTTP_STATUS.NOT_FOUND
          );
        }

        const plan = await this.membershipPlanRepository.findById(
          client.membershipPlanId
        );
        if (!plan) {
          throw new CustomError(
            "Membership plan not found",
            HTTP_STATUS.NOT_FOUND
          );
        }

        const planDurationInDays = plan.durationMonths * 30;
        const perSessionRate = plan.price / planDurationInDays;
        const trainerShare = perSessionRate * 0.8;
        const adminShare = perSessionRate * 0.2;

        const earningsData: Partial<ITrainerEarningsEntity> = {
          slotId,
          trainerId: slot.trainerId.toString(),
          clientId: slot.clientId!,
          membershipPlanId: client.membershipPlanId,
          amount: perSessionRate,
          trainerShare,
          adminShare,
          completedAt: new Date(),
        };

        await this.trainerEarningsRepository.save(earningsData);
        console.log(
          `Earnings saved for slot ${slotId}: trainer=${trainerShare}, admin=${adminShare}`
        );

        const payment = await this.paymentRepository.findOne(
          {
            clientId: slot.clientId,
            membershipPlanId: client.membershipPlanId,
            status: PaymentStatus.COMPLETED,
          },
          { createdAt: -1 }
        );

        if (payment && payment.id) {
          const newRemainingBalance =
            (payment.remainingBalance || plan.price) - perSessionRate;
          await this.paymentRepository.updateById(payment.id, {
            remainingBalance: Math.max(newRemainingBalance, 0),
            updatedAt: new Date(),
          });
          console.log(
            `Updated remainingBalance to ${newRemainingBalance} for payment ${payment.id}`
          );
        } else {
          console.warn(
            `No completed payment found for client ${slot.clientId} and plan ${client.membershipPlanId}`
          );
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        console.error(
          `Failed to save session history, earnings, or update payment for slot ${slotId}:`,
          error
        );
        throw error;
      } finally {
        session.endSession();
      }
    }

    return this.mapToEntity(updatedSlot);
  }
  async getVideoCallDetails(slotId: string): Promise<{
    videoCallStatus: VideoCallStatus;
    videoCallRoomName?: string;
    videoCallJwt?: string;
  } | null> {
    const slot = await SlotModel.findById(slotId).select(
      "videoCallStatus videoCallRoomName videoCallJwt"
    );
    return slot
      ? {
          videoCallStatus: slot.videoCallStatus ?? VideoCallStatus.NOT_STARTED,
          videoCallRoomName: slot.videoCallRoomName,
          videoCallJwt: slot.videoCallJwt,
        }
      : null;
  }

  async findAvailableSlots(trainerId: string): Promise<ISlotEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await this.model
      .find({
        trainerId,
        isBooked: false,
        status: SlotStatus.AVAILABLE,
        date: { $gte: today.toISOString().split("T")[0] },
      })
      .select("date startTime endTime _id")
      .lean();

    return slots.map(this.mapToEntity);
  }
  async findBookedSlotsByClientAndTrainer(
    clientId: string,
    trainerId: string
  ): Promise<ISlotEntity[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slots = await this.model
      .find({
        clientId,
        trainerId,
        status: SlotStatus.BOOKED,
        date: { $gte: today.toISOString().split("T")[0] },
      })
      .lean();
    return slots.map(this.mapToEntity);
  }
  async findSlotByTrainerAndTime(
    trainerId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ISlotEntity | null> {
    const slot = await this.model
      .findOne({
        trainerId,
        date,
        startTime,
        endTime,
        status: SlotStatus.AVAILABLE,
      })
      .lean();

    return slot ? this.mapToEntity(slot) : null;
  }
}
