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
exports.TrainerEarningsRepository = void 0;
const tsyringe_1 = require("tsyringe");
const trainer_earnings_model_1 = require("@/frameworks/database/mongoDB/models/trainer-earnings.model");
const base_repository_1 = require("../base.repository");
let TrainerEarningsRepository = class TrainerEarningsRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(trainer_earnings_model_1.TrainerEarningsModel);
    }
    findByTrainerId(trainerId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        trainerId,
                    },
                },
                {
                    $facet: {
                        items: [
                            { $sort: { completedAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        total: [
                            { $count: "count" },
                        ],
                    },
                },
                {
                    $project: {
                        items: 1,
                        total: {
                            $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0],
                        },
                    },
                },
            ];
            const result = yield this.model.aggregate(pipeline).exec();
            const { items, total } = result[0] || { items: [], total: 0 };
            return {
                items: items.map(this.mapToEntity),
                total,
            };
        });
    }
};
exports.TrainerEarningsRepository = TrainerEarningsRepository;
exports.TrainerEarningsRepository = TrainerEarningsRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], TrainerEarningsRepository);
