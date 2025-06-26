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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotExpiryProcessor = void 0;
const tsyringe_1 = require("tsyringe");
const session_history_model_1 = require("@/frameworks/database/mongoDB/models/session-history.model");
const constants_1 = require("@/shared/constants");
const client_model_1 = require("../../database/mongoDB/models/client.model");
const trainer_model_1 = require("../../database/mongoDB/models/trainer.model");
let SlotExpiryProcessor = class SlotExpiryProcessor {
    constructor(slotRepository) {
        this.slotRepository = slotRepository;
    }
    process(job) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slotId } = job.data;
            const session = yield session_history_model_1.SessionHistoryModel.startSession();
            session.startTransaction();
            try {
                let slot = yield this.slotRepository.findById(slotId);
                if (!slot) {
                    console.log(`Slot ${slotId} not found during expiry processing.`);
                    yield session.commitTransaction();
                    return;
                }
                console.log(`Slot ${slotId} has expired and is scheduled for deletion by TTL.`);
                // If the slot is booked and the video call is in progress, end it
                if (slot.status === constants_1.SlotStatus.BOOKED && slot.videoCallStatus === constants_1.VideoCallStatus.IN_PROGRESS) {
                    yield this.slotRepository.updateVideoCallStatus(slotId, constants_1.VideoCallStatus.ENDED);
                    console.log(`Automatically updated videoCallStatus to ENDED for slot ${slotId}`);
                    // Refresh the slot data after updating
                    slot = yield this.slotRepository.findById(slotId);
                    if (!slot) {
                        console.error(`Slot ${slotId} not found after updating videoCallStatus.`);
                        throw new Error("Slot not found after update");
                    }
                }
                // Save to session history if the slot was booked
                if (slot.status === constants_1.SlotStatus.BOOKED) {
                    // Check for existing session history to prevent duplicates
                    const existingHistory = yield session_history_model_1.SessionHistoryModel.findOne({
                        trainerId: slot.trainerId,
                        clientId: slot.clientId,
                        date: slot.date,
                        startTime: slot.startTime,
                    }).session(session);
                    if (!existingHistory) {
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
                        console.log(`Session history saved for slot ${slotId} with videoCallStatus: ${sessionHistoryData.videoCallStatus}`);
                    }
                    else {
                        console.log(`Session history already exists for slot ${slotId}`);
                    }
                }
                yield session.commitTransaction();
            }
            catch (error) {
                yield session.abortTransaction();
                console.error(`Error processing slot expiry for slot ${slotId}:`, error);
                throw error;
            }
            finally {
                session.endSession();
            }
        });
    }
};
exports.SlotExpiryProcessor = SlotExpiryProcessor;
exports.SlotExpiryProcessor = SlotExpiryProcessor = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __metadata("design:paramtypes", [Object])
], SlotExpiryProcessor);
