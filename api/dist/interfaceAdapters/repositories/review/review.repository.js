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
exports.ReviewRepository = void 0;
const tsyringe_1 = require("tsyringe");
const review_model_1 = require("@/frameworks/database/mongoDB/models/review.model");
const base_repository_1 = require("../base.repository");
let ReviewRepository = class ReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(review_model_1.ReviewModel);
    }
    createReview(review) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.save(review);
        });
    }
    updateReview(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, updates);
        });
    }
    findReviewsByTrainerId(trainerId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.find({ trainerId }, skip, limit);
        });
    }
    findLatestReviewsByTrainerId(trainerId_1) {
        return __awaiter(this, arguments, void 0, function* (trainerId, limit = 3) {
            const items = yield this.model
                .find({ trainerId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return items.map((item) => this.mapToEntity(item));
        });
    }
    findReviewByClientAndTrainer(clientId, trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOneAndMap({ clientId, trainerId });
        });
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
