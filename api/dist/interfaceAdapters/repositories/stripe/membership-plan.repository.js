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
exports.MembershipPlanRepository = void 0;
const tsyringe_1 = require("tsyringe");
const membership_plan_model_1 = require("@/frameworks/database/mongoDB/models/membership-plan.model");
const base_repository_1 = require("../base.repository");
let MembershipPlanRepository = class MembershipPlanRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(membership_plan_model_1.MembershipPlanModel);
    }
    findActivePlans() {
        return __awaiter(this, void 0, void 0, function* () {
            const plans = yield this.model.find({ isActive: true }).lean();
            return plans.map(plan => this.mapToEntity(plan));
        });
    }
    findByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plans = yield this.model
                    .find({ _id: { $in: ids } })
                    .select("name")
                    .lean();
                return plans.map((plan) => ({
                    id: plan._id.toString(),
                    name: plan.name,
                }));
            }
            catch (error) {
                console.error(`Error finding plans by IDs:`, error);
                throw error;
            }
        });
    }
};
exports.MembershipPlanRepository = MembershipPlanRepository;
exports.MembershipPlanRepository = MembershipPlanRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MembershipPlanRepository);
