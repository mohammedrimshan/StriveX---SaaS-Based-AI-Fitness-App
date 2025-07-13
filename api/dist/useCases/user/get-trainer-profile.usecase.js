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
exports.GetTrainerProfileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("@/shared/constants");
let GetTrainerProfileUseCase = class GetTrainerProfileUseCase {
    constructor(_trainerRepository, _reviewRepository, _clientRepository, _sessionHistoryRepository, _slotRepository) {
        this._trainerRepository = _trainerRepository;
        this._reviewRepository = _reviewRepository;
        this._clientRepository = _clientRepository;
        this._sessionHistoryRepository = _sessionHistoryRepository;
        this._slotRepository = _slotRepository;
    }
    execute(trainerId, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const trainer = yield this._trainerRepository.findById(trainerId);
            if (!trainer) {
                throw new Error("Trainer not found");
            }
            let age;
            if (trainer.dateOfBirth) {
                const dob = new Date(trainer.dateOfBirth);
                const today = new Date();
                age = today.getFullYear() - dob.getFullYear();
                if (today.getMonth() < dob.getMonth() ||
                    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
                    age--;
                }
            }
            const [latestReviews, allReviews, performanceStats, availableSlots] = yield Promise.all([
                this._reviewRepository.findLatestReviewsByTrainerId(trainerId, 3),
                this._reviewRepository.findReviewsByTrainerId(trainerId, 0, 0),
                this._sessionHistoryRepository.getPerformanceStats(trainerId),
                this._slotRepository.findAvailableSlots(trainerId),
            ]);
            const averageRating = allReviews.items.length > 0
                ? allReviews.items.reduce((sum, review) => sum + review.rating, 0) /
                    allReviews.items.length
                : 0;
            let canReview = false;
            if (clientId) {
                const client = yield this._clientRepository.findById(clientId);
                if (client &&
                    client.isPremium &&
                    client.selectedTrainerId === trainerId &&
                    client.selectStatus === constants_1.TrainerSelectionStatus.ACCEPTED) {
                    canReview = true;
                }
            }
            return {
                trainer: {
                    id: trainer.id,
                    fullName: `${trainer.firstName} ${trainer.lastName}`.trim(),
                    profileImage: trainer.profileImage,
                    experience: trainer.experience,
                    gender: trainer.gender,
                    age,
                    skills: trainer.skills,
                    certifications: trainer.certifications,
                },
                reviews: {
                    items: latestReviews,
                    averageRating,
                    totalReviewCount: allReviews.total,
                    canReview,
                },
                performanceStats,
                availableSlots: availableSlots.map((slot) => ({
                    slotId: slot.id,
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                })),
            };
        });
    }
};
exports.GetTrainerProfileUseCase = GetTrainerProfileUseCase;
exports.GetTrainerProfileUseCase = GetTrainerProfileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(1, (0, tsyringe_1.inject)("IReviewRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __param(3, (0, tsyringe_1.inject)("ISessionHistoryRepository")),
    __param(4, (0, tsyringe_1.inject)("ISlotRepository")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], GetTrainerProfileUseCase);
