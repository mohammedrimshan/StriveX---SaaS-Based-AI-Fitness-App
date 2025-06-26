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
exports.TrainerAcceptRejectRequestUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let TrainerAcceptRejectRequestUseCase = class TrainerAcceptRejectRequestUseCase {
    constructor(_clientRepository, _trainerRepository, _emailService, _paymentRepository, _slotRepository, _assignBackupTrainerUseCase) {
        this._clientRepository = _clientRepository;
        this._trainerRepository = _trainerRepository;
        this._emailService = _emailService;
        this._paymentRepository = _paymentRepository;
        this._slotRepository = _slotRepository;
        this._assignBackupTrainerUseCase = _assignBackupTrainerUseCase;
    }
    execute(trainerId, clientId, action, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const client = (yield this._clientRepository.findById(clientId)) ||
                (yield this._clientRepository.findByClientNewId(clientId));
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!client.isPremium || !client.subscriptionEndDate || client.subscriptionEndDate < new Date()) {
                throw new custom_error_1.CustomError("Active premium subscription required", constants_1.HTTP_STATUS.FORBIDDEN);
            }
            const trainer = yield this._trainerRepository.findById(trainerId);
            if (!trainer || trainer.approvalStatus !== constants_1.TrainerApprovalStatus.APPROVED) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!client.selectedTrainerId || client.selectedTrainerId !== trainerId) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.TRAINER_NOT_ASSIGNED_TO_CLIENT, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!trainer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainer.email)) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_TRAINER_EMAIL, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            const clientName = `${client.firstName} ${client.lastName}`;
            const trainerName = `${trainer.firstName} ${trainer.lastName}`;
            const internalClientId = client.id;
            if (action === "accept") {
                if (client.selectStatus !== constants_1.TrainerSelectionStatus.PENDING) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.REQUEST_NOT_PENDING, constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield this._trainerRepository.update(trainerId, {
                    clientCount: ((_a = trainer.clientCount) !== null && _a !== void 0 ? _a : 0) + 1,
                });
                const updatedClient = yield this._clientRepository.update(clientId, {
                    selectStatus: constants_1.TrainerSelectionStatus.ACCEPTED,
                });
                if (!updatedClient) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                const payments = yield this._paymentRepository.find({
                    clientId: internalClientId,
                    status: constants_1.PaymentStatus.COMPLETED,
                    $or: [{ trainerId: null }, { trainerId: { $exists: false } }],
                }, 0, 1000);
                if (payments.items.length > 0) {
                    yield this._paymentRepository.updateMany({
                        clientId: internalClientId,
                        status: constants_1.PaymentStatus.COMPLETED,
                        $or: [{ trainerId: null }, { trainerId: { $exists: false } }],
                    }, { trainerId, updatedAt: new Date() });
                }
                try {
                    const emailContent = (0, constants_1.TRAINER_ACCEPTANCE_MAIL_CONTENT)(trainerName, clientName);
                    yield this._emailService.sendEmail(client.email, "New Client Assignment", emailContent);
                }
                catch (error) {
                    console.log(error);
                }
                yield this._assignBackupTrainerUseCase.execute(clientId);
                return updatedClient;
            }
            if (action === "reject") {
                const updatedClient = yield this._clientRepository.updateByClientId(clientId, {
                    selectStatus: constants_1.TrainerSelectionStatus.REJECTED,
                    selectedTrainerId: undefined,
                });
                if (!updatedClient) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.FAILED_TO_UPDATE_SELECTION, constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                try {
                    const emailContent = (0, constants_1.TRAINER_REJECTION_MAIL_CONTENT)(trainerName, clientName, rejectionReason !== null && rejectionReason !== void 0 ? rejectionReason : "No reason provided.");
                    yield this._emailService.sendEmail(client.email, "Client Request Rejected", emailContent);
                }
                catch (error) {
                    console.log(error);
                }
                return updatedClient;
            }
            throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.INVALID_ACTION, constants_1.HTTP_STATUS.BAD_REQUEST);
        });
    }
};
exports.TrainerAcceptRejectRequestUseCase = TrainerAcceptRejectRequestUseCase;
exports.TrainerAcceptRejectRequestUseCase = TrainerAcceptRejectRequestUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IEmailService")),
    __param(3, (0, tsyringe_1.inject)("IPaymentRepository")),
    __param(4, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(5, (0, tsyringe_1.inject)("IAssignBackupTrainerUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TrainerAcceptRejectRequestUseCase);
