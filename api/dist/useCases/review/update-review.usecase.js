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
exports.UpdateReviewUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let UpdateReviewUseCase = class UpdateReviewUseCase {
    constructor(reviewRepository, clientRepository, trainerRepository) {
        this.reviewRepository = reviewRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
    }
    execute(reviewId, clientId, rating, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.clientRepository.findById(clientId);
            console.log(client, "update review");
            if (!client) {
                throw new Error("Client not found");
            }
            if (!client.isPremium) {
                throw new Error("Only premium clients can update reviews");
            }
            const review = yield this.reviewRepository.findReviewByClientAndTrainer(clientId, client.selectedTrainerId);
            if (!review || review.id !== reviewId) {
                throw new Error("Review not found or not authorized to update");
            }
            if (rating < 1 || rating > 5) {
                throw new Error("Rating must be between 1 and 5");
            }
            const updatedReview = yield this.reviewRepository.updateReview(reviewId, {
                rating,
                comment,
                updatedAt: new Date(),
            });
            if (!updatedReview) {
                throw new Error("Failed to update review");
            }
            yield this.updateTrainerRating(review.trainerId);
            return updatedReview;
        });
    }
    updateTrainerRating(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { items: reviews } = yield this.reviewRepository.findReviewsByTrainerId(trainerId, 0, 0);
            const reviewCount = reviews.length;
            const averageRating = reviewCount > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                : 0;
            yield this.trainerRepository.findByIdAndUpdate(trainerId, {
                rating: averageRating,
                reviewCount,
            });
        });
    }
};
exports.UpdateReviewUseCase = UpdateReviewUseCase;
exports.UpdateReviewUseCase = UpdateReviewUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IReviewRepository")),
    __param(1, (0, tsyringe_1.inject)("IClientRepository")),
    __param(2, (0, tsyringe_1.inject)("ITrainerRepository")),
    __metadata("design:paramtypes", [Object, Object, Object])
], UpdateReviewUseCase);
