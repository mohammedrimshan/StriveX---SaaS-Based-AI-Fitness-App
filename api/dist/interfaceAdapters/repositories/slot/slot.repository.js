"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotRepository = void 0;
const tsyringe_1 = require("tsyringe");
const slot_model_1 = require("../../../frameworks/database/mongoDB/models/slot.model");
const client_model_1 = require("@/frameworks/database/mongoDB/models/client.model");
const base_repository_1 = require("../base.repository");
const constants_1 = require("@/shared/constants");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_2 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
const cancellation_model_1 = require("@/frameworks/database/mongoDB/models/cancellation.model");
const trainer_model_1 = require("@/frameworks/database/mongoDB/models/trainer.model");
const session_history_model_1 = require("@/frameworks/database/mongoDB/models/session-history.model");
const mongoose_2 = __importDefault(require("mongoose"));
let SlotRepository = class SlotRepository extends base_repository_1.BaseRepository {
    constructor(membershipPlanRepository, clientRepository, trainerEarningsRepository, paymentRepository) {
        super(slot_model_1.SlotModel);
        this.membershipPlanRepository = membershipPlanRepository;
        this.clientRepository = clientRepository;
        this.trainerEarningsRepository = trainerEarningsRepository;
        this.paymentRepository = paymentRepository;
    }
    saveToSessionHistory(slot, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingHistory = yield session_history_model_1.SessionHistoryModel.findOne({
                trainerId: slot.trainerId,
                clientId: slot.clientId,
                date: slot.date,
                startTime: slot.startTime,
            }).session(session);
            if (existingHistory) {
                console.log(`Session history already exists for slot ${slot.id}`);
                return;
            }
            const trainer = yield trainer_model_1.TrainerModel.findById(slot.trainerId)
                .select("firstName lastName")
                .lean()
                .session(session);
            const client = slot.clientId
                ? yield client_model_1.ClientModel.findById(slot.clientId)
                    .select("firstName lastName")
                    .lean()
                    .session(session)
                : null;
            const sessionHistoryData = {
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
            yield session_history_model_1.SessionHistoryModel.create([sessionHistoryData], { session });
            console.log(`Session history saved for slot ${slot.id} with videoCallStatus: ${slot.videoCallStatus}`);
        });
    }
    findByTrainerId(trainerId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = Object.assign({ trainerId }, (startTime &&
                endTime && {
                startTime: { $gte: startTime },
                endTime: { $lte: endTime },
            }));
            return (yield this.model.find(filter).lean()).map(this.mapToEntity);
        });
    }
    findOverlappingSlots(trainerId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const startDate = startTime.toISOString().split("T")[0];
            const filter = {
                trainerId,
                date: startDate,
                $or: [
                    {
                        startTime: {
                            $lt: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
                            $gte: `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`,
                        },
                    },
                    {
                        endTime: {
                            $gt: `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`,
                            $lte: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
                        },
                    },
                    {
                        startTime: {
                            $lte: `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`,
                        },
                        endTime: {
                            $gte: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
                        },
                    },
                ],
            };
            return (yield this.model.find(filter).lean()).map(this.mapToEntity);
        });
    }
    updateStatus(slotId, status, clientId, isBooked, cancellationReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.findById(slotId);
            if (!slot) {
                throw new custom_error_1.CustomError("Slot not found", constants_2.HTTP_STATUS.NOT_FOUND);
            }
            const updates = {
                status,
                isBooked: status === constants_1.SlotStatus.BOOKED ? true : false,
                isAvailable: status === constants_1.SlotStatus.AVAILABLE ? true : false,
                bookedAt: status === constants_1.SlotStatus.BOOKED ? new Date() : undefined,
                cancellationReason: status === constants_1.SlotStatus.AVAILABLE ? cancellationReason : undefined,
            };
            updates.clientId = clientId !== undefined ? clientId : undefined;
            if (status === constants_1.SlotStatus.BOOKED && !clientId) {
                throw new custom_error_1.CustomError("Client ID required for booking a slot", constants_2.HTTP_STATUS.BAD_REQUEST);
            }
            return this.update(slotId, updates);
        });
    }
    findBookedSlotByClientId(clientId, slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.model
                .findOne({ _id: slotId, clientId, status: constants_1.SlotStatus.BOOKED })
                .lean();
            return slot ? this.mapToEntity(slot) : null;
        });
    }
    findBookedSlotByClientIdAndDate(clientId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.model
                .findOne({
                clientId,
                date,
                status: constants_1.SlotStatus.BOOKED,
            })
                .lean();
            return slot ? this.mapToEntity(slot) : null;
        });
    }
    getSlotsWithStatus(trainerId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchStage = Object.assign({ trainerId: new mongoose_1.Types.ObjectId(trainerId) }, (startTime &&
                endTime && {
                date: startTime.toISOString().split("T")[0],
                startTime: {
                    $gte: `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`,
                },
                endTime: {
                    $lte: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
                },
            }));
            const slots = yield this.model
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
                        isBooked: { $eq: ["$status", constants_1.SlotStatus.BOOKED] },
                        isAvailable: { $eq: ["$status", constants_1.SlotStatus.AVAILABLE] },
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
        });
    }
    findTrainerSlotsByClientId(userClientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield client_model_1.ClientModel.findOne({ clientId: userClientId }).lean();
            if (!client || !client.selectedTrainerId) {
                return [];
            }
            const slots = yield this.model
                .find({ trainerId: client.selectedTrainerId })
                .lean();
            return slots.map(this.mapToEntity);
        });
    }
    findBookedSlotsByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clientId || typeof clientId !== "string" || clientId.trim() === "") {
                throw new custom_error_1.CustomError("Valid Client ID is required", constants_2.HTTP_STATUS.BAD_REQUEST);
            }
            const matchStage = {
                clientId: { $eq: clientId },
                status: constants_1.SlotStatus.BOOKED,
            };
            const slots = yield this.model
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
                        isBooked: { $eq: ["$status", constants_1.SlotStatus.BOOKED] },
                        isAvailable: { $eq: ["$status", constants_1.SlotStatus.AVAILABLE] },
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
        });
    }
    updateVideoCallStatus(slotId, videoCallStatus, videoCallRoomName, videoCallJwt) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = { videoCallStatus };
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
            const updatedSlot = yield this.update(slotId, updates);
            return updatedSlot;
        });
    }
    findByRoomName(roomName) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.model
                .findOne({ videoCallRoomName: roomName })
                .lean();
            return slot ? this.mapToEntity(slot) : null;
        });
    }
    findSlotsWithClients(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield slot_model_1.SlotModel.find({
                trainerId: new mongoose_1.Types.ObjectId(trainerId),
            }).lean();
            const clientIds = slots
                .filter((slot) => slot.clientId)
                .map((slot) => slot.clientId);
            const slotIds = slots.map((slot) => slot._id);
            const clients = yield client_model_1.ClientModel.find({ _id: { $in: clientIds } })
                .select("_id firstName lastName email profileImage")
                .lean();
            const trainer = yield trainer_model_1.TrainerModel.findById(trainerId)
                .select("firstName lastName")
                .lean();
            const cancellations = yield cancellation_model_1.CancellationModel.find({
                slotId: { $in: slotIds },
            })
                .select("slotId cancellationReason")
                .lean();
            const cancellationsMap = cancellations.reduce((acc, cancel) => {
                const slotIdStr = cancel.slotId.toString();
                if (!acc[slotIdStr])
                    acc[slotIdStr] = [];
                acc[slotIdStr].push(cancel.cancellationReason);
                return acc;
            }, {});
            return slots.map((slot) => {
                var _a;
                const client = slot.clientId
                    ? clients.find((c) => { var _a; return c._id.toString() === ((_a = slot.clientId) === null || _a === void 0 ? void 0 : _a.toString()); })
                    : undefined;
                return Object.assign(Object.assign({}, slot), { id: slot._id.toString(), trainerName: trainer
                        ? `${trainer.firstName} ${trainer.lastName}`
                        : "Unknown Trainer", client: client
                        ? {
                            clientId: client._id.toString(),
                            firstName: client.firstName,
                            lastName: client.lastName,
                            email: client.email,
                            profileImage: client.profileImage,
                        }
                        : undefined, cancellationReasons: (_a = cancellationsMap[slot._id.toString()]) !== null && _a !== void 0 ? _a : undefined });
            });
        });
    }
    endVideoCall(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield slot_model_1.SlotModel.findById(slotId).lean();
            if (!slot) {
                throw new custom_error_1.CustomError("Slot not found", constants_2.HTTP_STATUS.NOT_FOUND);
            }
            const updatedSlot = yield slot_model_1.SlotModel.findByIdAndUpdate(slotId, {
                videoCallStatus: constants_1.VideoCallStatus.ENDED,
                videoCallRoomName: null,
                videoCallJwt: null,
            }, { new: true }).lean();
            if (!updatedSlot) {
                throw new custom_error_1.CustomError("Failed to update slot", constants_2.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            if (updatedSlot.status === constants_1.SlotStatus.BOOKED) {
                const session = yield mongoose_2.default.startSession();
                session.startTransaction();
                try {
                    yield this.saveToSessionHistory(this.mapToEntity(updatedSlot));
                    console.log(`Session history saved for slot ${slotId}`);
                    const client = yield this.clientRepository.findByClientNewId(slot.clientId);
                    if (!client || !client.membershipPlanId) {
                        throw new custom_error_1.CustomError("Client or membership plan not found", constants_2.HTTP_STATUS.NOT_FOUND);
                    }
                    const plan = yield this.membershipPlanRepository.findById(client.membershipPlanId);
                    if (!plan) {
                        throw new custom_error_1.CustomError("Membership plan not found", constants_2.HTTP_STATUS.NOT_FOUND);
                    }
                    const planDurationInDays = plan.durationMonths * 30;
                    const perSessionRate = plan.price / planDurationInDays;
                    const trainerShare = perSessionRate * 0.8;
                    const adminShare = perSessionRate * 0.2;
                    const earningsData = {
                        slotId,
                        trainerId: slot.trainerId.toString(),
                        clientId: slot.clientId,
                        membershipPlanId: client.membershipPlanId,
                        amount: perSessionRate,
                        trainerShare,
                        adminShare,
                        completedAt: new Date(),
                    };
                    yield this.trainerEarningsRepository.save(earningsData);
                    console.log(`Earnings saved for slot ${slotId}: trainer=${trainerShare}, admin=${adminShare}`);
                    const payment = yield this.paymentRepository.findOne({
                        clientId: slot.clientId,
                        membershipPlanId: client.membershipPlanId,
                        status: constants_1.PaymentStatus.COMPLETED,
                    }, { createdAt: -1 });
                    if (payment && payment.id) {
                        const newRemainingBalance = (payment.remainingBalance || plan.price) - perSessionRate;
                        yield this.paymentRepository.updateById(payment.id, {
                            remainingBalance: Math.max(newRemainingBalance, 0),
                            updatedAt: new Date(),
                        });
                        console.log(`Updated remainingBalance to ${newRemainingBalance} for payment ${payment.id}`);
                    }
                    else {
                        console.warn(`No completed payment found for client ${slot.clientId} and plan ${client.membershipPlanId}`);
                    }
                    yield session.commitTransaction();
                }
                catch (error) {
                    yield session.abortTransaction();
                    console.error(`Failed to save session history, earnings, or update payment for slot ${slotId}:`, error);
                    throw error;
                }
                finally {
                    session.endSession();
                }
            }
            return this.mapToEntity(updatedSlot);
        });
    }
    getVideoCallDetails(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const slot = yield slot_model_1.SlotModel.findById(slotId).select("videoCallStatus videoCallRoomName videoCallJwt");
            return slot
                ? {
                    videoCallStatus: (_a = slot.videoCallStatus) !== null && _a !== void 0 ? _a : constants_1.VideoCallStatus.NOT_STARTED,
                    videoCallRoomName: slot.videoCallRoomName,
                    videoCallJwt: slot.videoCallJwt,
                }
                : null;
        });
    }
    findAvailableSlots(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const slots = yield this.model
                .find({
                trainerId,
                isBooked: false,
                status: constants_1.SlotStatus.AVAILABLE,
                date: { $gte: today.toISOString().split("T")[0] },
            })
                .select("date startTime endTime _id")
                .lean();
            return slots.map(this.mapToEntity);
        });
    }
    findBookedSlotsByClientAndTrainer(clientId, trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const slots = yield this.model
                .find({
                clientId,
                trainerId,
                status: constants_1.SlotStatus.BOOKED,
                date: { $gte: today.toISOString().split("T")[0] },
            })
                .lean();
            return slots.map(this.mapToEntity);
        });
    }
    findSlotByTrainerAndTime(trainerId, date, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this.model
                .findOne({
                trainerId,
                date,
                startTime,
                endTime,
                status: constants_1.SlotStatus.AVAILABLE,
            })
                .lean();
            return slot ? this.mapToEntity(slot) : null;
        });
    }
};
exports.SlotRepository = SlotRepository;
exports.SlotRepository = SlotRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IMembershipPlanRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerEarningsRepository")),
    __param(3, (0, tsyringe_1.inject)("IPaymentRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SlotRepository);
