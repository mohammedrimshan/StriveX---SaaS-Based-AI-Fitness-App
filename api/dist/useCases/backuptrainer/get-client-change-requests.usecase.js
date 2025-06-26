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
exports.GetClientChangeRequestsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let GetClientChangeRequestsUseCase = class GetClientChangeRequestsUseCase {
    constructor(changeRequestRepository, clientRepository, trainerRepository) {
        this.changeRequestRepository = changeRequestRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(clientId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientRepository.findById(clientId);
            if (!client) {
                throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.USER_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND);
            }
            const requests = yield this.changeRequestRepository.findByClientId(clientId);
            const total = requests.length;
            const paginatedItems = requests.slice(skip, skip + limit);
            // Enrich requests with trainer details
            const enrichedItems = yield Promise.all(paginatedItems.map((request) => __awaiter(this, void 0, void 0, function* () {
                const trainer = yield this.trainerRepository.findById(request.backupTrainerId);
                return Object.assign(Object.assign({}, request), { backupTrainer: trainer ? {
                        id: trainer.id,
                        firstName: trainer.firstName,
                        lastName: trainer.lastName,
                        profileImage: trainer.profileImage
                    } : null });
            })));
            return { items: enrichedItems, total };
        });
    }
};
exports.GetClientChangeRequestsUseCase = GetClientChangeRequestsUseCase;
exports.GetClientChangeRequestsUseCase = GetClientChangeRequestsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITrainerChangeRequestRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetClientChangeRequestsUseCase);
