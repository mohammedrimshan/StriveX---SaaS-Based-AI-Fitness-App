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
exports.BackupTrainerInvitationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const backuptrainerinvitation_model_1 = require("@/frameworks/database/mongoDB/models/backuptrainerinvitation.model");
const base_repository_1 = require("../base.repository");
const constants_1 = require("@/shared/constants");
let BackupTrainerInvitationRepository = class BackupTrainerInvitationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(backuptrainerinvitation_model_1.BackupTrainerInvitationModel);
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitations = yield this.model.find({ clientId }).lean();
            return invitations.map((inv) => this.mapToEntity(inv));
        });
    }
    findPendingByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitations = yield this.model
                .find({
                clientId,
                status: constants_1.BackupInvitationStatus.PENDING,
                expiresAt: { $gt: new Date() },
            })
                .lean();
            return invitations.map((inv) => this.mapToEntity(inv));
        });
    }
    updateStatus(id, status, respondedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = { status };
            if (respondedAt)
                updates.respondedAt = respondedAt;
            return this.findOneAndUpdateAndMap({ _id: id }, updates);
        });
    }
    findExpiredInvitations() {
        return __awaiter(this, void 0, void 0, function* () {
            const invitations = yield this.model
                .find({
                status: constants_1.BackupInvitationStatus.PENDING,
                expiresAt: { $lte: new Date() },
            })
                .lean();
            return invitations.map((inv) => this.mapToEntity(inv));
        });
    }
    updateManyStatusByClientIdExcept(clientId, excludeInvitationId, status, updatedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.updateMany({
                clientId,
                _id: { $ne: excludeInvitationId },
                status: constants_1.BackupInvitationStatus.PENDING,
            }, {
                $set: {
                    status,
                    updatedAt,
                },
            });
        });
    }
    findByClientIdAndStatus(clientId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.find({ clientId, status }).exec();
        });
    }
};
exports.BackupTrainerInvitationRepository = BackupTrainerInvitationRepository;
exports.BackupTrainerInvitationRepository = BackupTrainerInvitationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], BackupTrainerInvitationRepository);
