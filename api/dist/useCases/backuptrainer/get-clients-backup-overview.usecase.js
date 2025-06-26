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
exports.GetClientsBackupOverviewUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GetClientsBackupOverviewUseCase = class GetClientsBackupOverviewUseCase {
    constructor(clientRepository, trainerRepository) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const clients = yield this.clientRepository.find({}, skip, limit);
            const clientsWithBackup = clients.items.filter(client => !!client.backupTrainerId);
            const enrichedItems = yield Promise.all(clientsWithBackup.map((client) => __awaiter(this, void 0, void 0, function* () {
                if (client.backupTrainerId) {
                    const backupTrainer = yield this.trainerRepository.findById(client.backupTrainerId);
                    if ((backupTrainer === null || backupTrainer === void 0 ? void 0 : backupTrainer.id) && backupTrainer.firstName && backupTrainer.lastName) {
                        client.backupTrainer = {
                            id: backupTrainer.id,
                            firstName: backupTrainer.firstName,
                            lastName: backupTrainer.lastName,
                            profileImage: backupTrainer.profileImage,
                            specialization: backupTrainer.specialization,
                        };
                    }
                    else {
                        client.backupTrainer = null;
                    }
                }
                return client;
            })));
            return { items: enrichedItems, total: clientsWithBackup.length };
        });
    }
};
exports.GetClientsBackupOverviewUseCase = GetClientsBackupOverviewUseCase;
exports.GetClientsBackupOverviewUseCase = GetClientsBackupOverviewUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object])
], GetClientsBackupOverviewUseCase);
