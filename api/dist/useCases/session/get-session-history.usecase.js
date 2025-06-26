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
exports.GetSessionHistoryUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
let GetSessionHistoryUseCase = class GetSessionHistoryUseCase {
    constructor(sessionHistoryRepository, trainerRepository, clientRepository, adminRepository) {
        this.sessionHistoryRepository = sessionHistoryRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
        this.adminRepository = adminRepository;
    }
    execute(userId, role, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("UseCase: Received role:", role, "Expected roles:", constants_1.ROLES); // Add logging
            if (role === constants_1.ROLES.TRAINER) {
                const trainer = yield this.trainerRepository.findById(userId);
                if (!trainer) {
                    throw new custom_error_1.CustomError("Trainer not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                return this.sessionHistoryRepository.find({ trainerId: new mongoose_1.Types.ObjectId(userId), status: constants_1.SlotStatus.BOOKED }, skip, limit);
            }
            else if (role === constants_1.ROLES.USER) {
                const client = yield this.clientRepository.findByClientNewId(userId);
                if (!client) {
                    throw new custom_error_1.CustomError("Client not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                return this.sessionHistoryRepository.find({ clientId: new mongoose_1.Types.ObjectId(userId), status: constants_1.SlotStatus.BOOKED }, skip, limit);
            }
            else if (role === constants_1.ROLES.ADMIN) {
                const admin = yield this.adminRepository.findById(userId);
                console.log(admin, "UseCase: Admin found:", admin);
                if (!admin) {
                    throw new custom_error_1.CustomError("Admin not found", constants_1.HTTP_STATUS.NOT_FOUND);
                }
                return this.sessionHistoryRepository.find({}, skip, limit);
            }
            else {
                throw new custom_error_1.CustomError("Invalid role", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
};
exports.GetSessionHistoryUseCase = GetSessionHistoryUseCase;
exports.GetSessionHistoryUseCase = GetSessionHistoryUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISessionHistoryRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __param(3, (0, tsyringe_1.inject)("IAdminRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetSessionHistoryUseCase);
