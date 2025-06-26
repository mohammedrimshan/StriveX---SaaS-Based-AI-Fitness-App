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
exports.GetClientBackupInvitationsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetClientBackupInvitationsUseCase = class GetClientBackupInvitationsUseCase {
    constructor(invitationRepository, clientRepository, trainerRepository) {
        this.invitationRepository = invitationRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(clientId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const invitations = yield this.invitationRepository.findByClientId(clientId);
            const total = invitations.length;
            const paginatedItems = invitations.slice(skip, skip + limit);
            // Enrich invitations with trainer details
            const enrichedItems = yield Promise.all(paginatedItems.map((invitation) => __awaiter(this, void 0, void 0, function* () {
                const trainer = yield this.trainerRepository.findById(invitation.trainerId);
                return Object.assign(Object.assign({}, invitation), { trainer: trainer ? {
                        id: trainer.id,
                        firstName: trainer.firstName,
                        lastName: trainer.lastName,
                        profileImage: trainer.profileImage,
                        specialization: trainer.specialization
                    } : null });
            })));
            return { items: enrichedItems, total };
        });
    }
};
exports.GetClientBackupInvitationsUseCase = GetClientBackupInvitationsUseCase;
exports.GetClientBackupInvitationsUseCase = GetClientBackupInvitationsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IBackupTrainerInvitationRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetClientBackupInvitationsUseCase);
