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
exports.ReviewController = void 0;
const tsyringe_1 = require("tsyringe");
const errorHandler_1 = require("@/shared/utils/errorHandler");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let ReviewController = class ReviewController {
    constructor(createReviewUseCase, updateReviewUseCase, getTrainerReviewsUseCase) {
        this.createReviewUseCase = createReviewUseCase;
        this.updateReviewUseCase = updateReviewUseCase;
        this.getTrainerReviewsUseCase = getTrainerReviewsUseCase;
    }
    submitReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { clientId, trainerId, rating, comment } = req.body;
                const review = yield this.createReviewUseCase.execute(clientId, trainerId, rating, comment);
                res.status(201).json({
                    success: true,
                    data: review,
                    message: "Review submitted successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { reviewId, rating, comment } = req.body;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                console.log(reviewId, clientId, rating, comment, "from update review ");
                const updatedReview = yield this.updateReviewUseCase.execute(reviewId, clientId, rating, comment);
                res.status(200).json({
                    success: true,
                    data: updatedReview,
                    message: "Review updated successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTrainerReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { skip = 0, limit = 10 } = req.query;
                const reviews = yield this.getTrainerReviewsUseCase.execute(trainerId, Number(skip), Number(limit));
                res.status(200).json({
                    success: true,
                    data: reviews,
                    message: "Reviews retrieved successfully",
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.ReviewController = ReviewController;
exports.ReviewController = ReviewController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICreateReviewUseCase")),
    __param(1, (0, tsyringe_1.inject)("IUpdateReviewUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetTrainerReviewsUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object])
], ReviewController);
