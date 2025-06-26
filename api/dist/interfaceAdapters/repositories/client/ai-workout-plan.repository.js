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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDietPlanRepository = exports.AiWorkoutPlanRepository = void 0;
const tsyringe_1 = require("tsyringe");
const ai_workout_model_1 = require("@/frameworks/database/mongoDB/models/ai-workout.model");
const ai_dietplan_model_1 = require("@/frameworks/database/mongoDB/models/ai-dietplan.model");
const base_repository_1 = require("../base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
let AiWorkoutPlanRepository = class AiWorkoutPlanRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(ai_workout_model_1.WorkoutPlanModel);
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const plans = yield this.model
                .find({ clientId })
                .sort({ createdAt: -1 })
                .lean();
            return plans.map((plan) => this.mapToEntity(plan));
        });
    }
    update(id, plan) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id))
                return null;
            const updatedPlan = yield this.model
                .findByIdAndUpdate(id, { $set: Object.assign(Object.assign({}, plan), { updatedAt: new Date() }) }, { new: true })
                .lean();
            if (!updatedPlan)
                return null;
            return this.mapToEntity(updatedPlan);
        });
    }
};
exports.AiWorkoutPlanRepository = AiWorkoutPlanRepository;
exports.AiWorkoutPlanRepository = AiWorkoutPlanRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], AiWorkoutPlanRepository);
let AiDietPlanRepository = class AiDietPlanRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(ai_dietplan_model_1.DietPlanModel);
    }
    findByClientId(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const plans = yield this.model
                .find({ clientId })
                .sort({ createdAt: -1 })
                .lean();
            return plans.map((plan) => this.mapToEntity(plan));
        });
    }
    update(id, plan) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id))
                return null;
            const updatedPlan = yield this.model
                .findByIdAndUpdate(id, { $set: Object.assign(Object.assign({}, plan), { updatedAt: new Date() }) }, { new: true })
                .lean();
            if (!updatedPlan)
                return null;
            return this.mapToEntity(updatedPlan);
        });
    }
};
exports.AiDietPlanRepository = AiDietPlanRepository;
exports.AiDietPlanRepository = AiDietPlanRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], AiDietPlanRepository);
