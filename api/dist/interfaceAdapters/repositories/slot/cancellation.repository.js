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
exports.CancellationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const cancellation_model_1 = require("@/frameworks/database/mongoDB/models/cancellation.model");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const mongoose_1 = require("mongoose");
const base_repository_1 = require("../base.repository");
let CancellationRepository = class CancellationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(cancellation_model_1.CancellationModel);
    }
    mapToEntity(doc) {
        var _a, _b, _c, _d, _e, _f;
        return {
            id: (_a = doc._id) === null || _a === void 0 ? void 0 : _a.toString(),
            slotId: (_b = doc.slotId) === null || _b === void 0 ? void 0 : _b.toString(),
            clientId: ((_d = (_c = doc.clientId) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) || doc.clientId,
            trainerId: ((_f = (_e = doc.trainerId) === null || _e === void 0 ? void 0 : _e._id) === null || _f === void 0 ? void 0 : _f.toString()) || doc.trainerId,
            cancellationReason: doc.cancellationReason,
            cancelledBy: doc.cancelledBy,
            cancelledAt: doc.cancelledAt,
        };
    }
    save(data) {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.slotId ||
                !data.clientId ||
                !data.trainerId ||
                !data.cancellationReason ||
                !data.cancelledBy) {
                throw new custom_error_1.CustomError("Slot ID, Client ID, Trainer ID, and cancellation reason are required", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!mongoose_1.Types.ObjectId.isValid(data.slotId) ||
                !mongoose_1.Types.ObjectId.isValid(data.clientId) ||
                !mongoose_1.Types.ObjectId.isValid(data.trainerId)) {
                throw new custom_error_1.CustomError("Invalid Slot ID, Client ID, or Trainer ID", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (data.cancelledBy !== "client" && data.cancelledBy !== "trainer") {
                throw new custom_error_1.CustomError("CancelledBy field must be 'client' or 'trainer'", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const cancellationData = {
                slotId: data.slotId,
                clientId: data.clientId,
                trainerId: data.trainerId,
                cancellationReason: data.cancellationReason,
                cancelledBy: data.cancelledBy,
                cancelledAt: data.cancelledAt || new Date(),
            };
            return _super.save.call(this, cancellationData);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new custom_error_1.CustomError("Invalid cancellation ID", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const cancellation = yield this.model
                .findById(id)
                .populate("clientId", "clientId firstName lastName email profileImage")
                .populate("trainerId", "clientId firstName lastName email profileImage")
                .lean();
            return cancellation ? this.mapToEntity(cancellation) : null;
        });
    }
    findBySlotId(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(slotId)) {
                throw new custom_error_1.CustomError("Invalid slot ID", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const cancellation = yield this.model
                .findOne({ slotId })
                .populate("clientId", "clientId firstName lastName email profileImage")
                .populate("trainerId", "clientId firstName lastName email profileImage")
                .lean();
            return cancellation ? this.mapToEntity(cancellation) : null;
        });
    }
    findByTrainerId(trainerId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(trainerId)) {
                throw new custom_error_1.CustomError("Invalid trainer ID", constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            const filter = { trainerId: new mongoose_1.Types.ObjectId(trainerId) };
            if (date) {
                if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    throw new custom_error_1.CustomError("Date must be in YYYY-MM-DD format", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                filter.cancelledAt = {
                    $gte: new Date(`${date}T00:00:00.000Z`),
                    $lte: new Date(`${date}T23:59:59.999Z`),
                };
            }
            const cancellations = yield this.model
                .find(filter)
                .populate("clientId", "clientId firstName lastName email profileImage")
                .populate("trainerId", "clientId firstName lastName email profileImage")
                .lean();
            return cancellations.map((item) => this.mapToEntity(item));
        });
    }
};
exports.CancellationRepository = CancellationRepository;
exports.CancellationRepository = CancellationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CancellationRepository);
