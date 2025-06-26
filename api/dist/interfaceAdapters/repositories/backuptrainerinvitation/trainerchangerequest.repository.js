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
exports.TrainerChangeRequestRepository = void 0;
const tsyringe_1 = require("tsyringe");
const trainerchangerequest_model_1 = require("@/frameworks/database/mongoDB/models/trainerchangerequest.model");
const base_repository_1 = require("../base.repository");
const constants_1 = require("@/shared/constants");
let TrainerChangeRequestRepository = class TrainerChangeRequestRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(trainerchangerequest_model_1.TrainerChangeRequestModel);
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield this.model.find({ clientId }).lean();
            return requests.map((req) => this.mapToEntity(req));
        });
    }
    findPendingRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = yield this.model
                .find({ status: constants_1.TrainerChangeRequestStatus.PENDING })
                .lean();
            return requests.map((req) => this.mapToEntity(req));
        });
    }
    updateStatus(id, status, resolvedBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = {
                status,
                resolvedAt: new Date(),
                resolvedBy,
            };
            return this.findOneAndUpdateAndMap({ _id: id }, updates);
        });
    }
};
exports.TrainerChangeRequestRepository = TrainerChangeRequestRepository;
exports.TrainerChangeRequestRepository = TrainerChangeRequestRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TrainerChangeRequestRepository);
