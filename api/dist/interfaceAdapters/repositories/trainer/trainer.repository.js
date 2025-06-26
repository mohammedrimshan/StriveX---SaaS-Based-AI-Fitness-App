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
exports.TrainerRepository = void 0;
const tsyringe_1 = require("tsyringe");
const trainer_model_1 = require("@/frameworks/database/mongoDB/models/trainer.model");
const constants_1 = require("@/shared/constants");
const base_repository_1 = require("../base.repository");
const slot_model_1 = require("@/frameworks/database/mongoDB/models/slot.model");
const mongoose_1 = require("mongoose");
let TrainerRepository = class TrainerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(trainer_model_1.TrainerModel);
    }
    save(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.model.create(data);
            return this.mapToEntity(trainer.toObject());
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.model.findOne({ email }).lean();
            if (!trainer)
                return null;
            return this.mapToEntity(trainer);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.model
                .findOne({ $or: [{ _id: id }, { clientId: id }] })
                .lean();
            if (!trainer)
                return null;
            return this.mapToEntity(trainer);
        });
    }
    find(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [trainers, total] = yield Promise.all([
                this.model
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(filter),
            ]);
            const transformedTrainers = trainers.map((trainer) => this.mapToEntity(trainer));
            return { items: transformedTrainers, total };
        });
    }
    updateByEmail(email, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.model
                .findOneAndUpdate({ email }, { $set: updates }, { new: true })
                .lean();
            if (!trainer)
                return null;
            return this.mapToEntity(trainer);
        });
    }
    findByIdAndUpdate(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this.model
                .findByIdAndUpdate(id, { $set: updateData }, { new: true })
                .lean();
            if (!trainer)
                return null;
            return this.mapToEntity(trainer);
        });
    }
    updateApprovalStatus(id, status, rejectionReason, approvedByAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = { approvalStatus: status };
            if (rejectionReason !== undefined)
                updateData.rejectionReason = rejectionReason;
            if (approvedByAdmin !== undefined)
                updateData.approvedByAdmin = approvedByAdmin;
            const trainer = yield this.model
                .findByIdAndUpdate(id, { $set: updateData }, { new: true })
                .lean();
            if (!trainer)
                return null;
            return this.mapToEntity(trainer);
        });
    }
    findByIdAndUpdatePassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndUpdate(id, { password });
        });
    }
    findBackupTrainerForClient(excludedTrainerId, specialization) {
        return __awaiter(this, void 0, void 0, function* () {
            return trainer_model_1.TrainerModel.findOne({
                _id: { $ne: excludedTrainerId },
                approvalStatus: constants_1.TrainerApprovalStatus.APPROVED,
                isOnline: true,
                specialization: { $in: [specialization] },
            }).lean();
        });
    }
    addBackupClient(trainerId, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ _id: trainerId }, {
                $addToSet: { backupClientIds: clientId },
            });
        });
    }
    removeBackupClient(trainerId, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ _id: trainerId }, {
                $pull: { backupClientIds: clientId },
            });
        });
    }
    updateOptOutBackupRole(trainerId, optOut) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndUpdateAndMap({ _id: trainerId }, { optOutBackupRole: optOut });
        });
    }
    findAvailableBackupTrainers(clientPreferences, excludedTrainerIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferredWorkout = clientPreferences.preferredWorkout || "";
            const filter = Object.assign(Object.assign({ approvalStatus: constants_1.TrainerApprovalStatus.APPROVED, status: "active", optOutBackupRole: false, _id: { $nin: excludedTrainerIds } }, (preferredWorkout
                ? { specialization: { $in: [preferredWorkout] } }
                : {})), { $expr: {
                    $lt: [
                        { $size: { $ifNull: ["$backupClientIds", []] } },
                        { $ifNull: ["$maxBackupClients", 5] },
                    ],
                } });
            const trainers = yield this.model
                .find(filter)
                .sort({ experience: -1 })
                .limit(3)
                .lean();
            return trainers.map((trainer) => this.mapToEntity(trainer));
        });
    }
    findTrainerWithBackupClients(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findById(trainerId)
                .populate({
                path: "backupClientIds",
                select: "firstName lastName profileImage clientId",
            })
                .lean();
        });
    }
    findAvailableTrainersBySkillsOrPreferredWorkout(date, startTime, endTime, clientSkills, clientPreferredWorkout, excludedTrainerIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate and convert excludedTrainerIds to ObjectId array
            const excludedIds = excludedTrainerIds
                .filter((id) => mongoose_1.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_1.Types.ObjectId(id));
            // Base query to filter trainers who are active, approved, not opted out of backup role, and have less than maxBackupClients
            const baseQuery = {
                approvalStatus: constants_1.TrainerApprovalStatus.APPROVED,
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
            }
            else if (clientPreferredWorkout) {
                baseQuery.specializations = clientPreferredWorkout;
                // if specializations is an array, this matches trainers where preferred workout is present inside specializations
                // if specializations is stored as array field, this works fine
            }
            // Find trainers matching criteria
            const trainers = yield this.model.find(baseQuery).lean();
            const availableTrainers = [];
            // Filter trainers by availability (no conflicting booked slots)
            for (const trainer of trainers) {
                const conflictingSlots = yield slot_model_1.SlotModel.find({
                    trainerId: trainer._id,
                    date,
                    $or: [
                        {
                            startTime: { $lt: endTime },
                            endTime: { $gt: startTime },
                        },
                    ],
                    status: constants_1.SlotStatus.BOOKED,
                }).lean();
                if (conflictingSlots.length === 0) {
                    availableTrainers.push(this.mapToEntity(trainer));
                }
            }
            return availableTrainers;
        });
    }
};
exports.TrainerRepository = TrainerRepository;
exports.TrainerRepository = TrainerRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TrainerRepository);
