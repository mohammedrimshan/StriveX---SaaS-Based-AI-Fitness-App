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
exports.TrainerDashboardController = void 0;
const tsyringe_1 = require("tsyringe");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let TrainerDashboardController = class TrainerDashboardController {
    constructor(getDashboardStatsUseCase, getUpcomingSessionsUsecase, getWeeklySessionStatsUsecase, getClientFeedbackUsecase, getEarningsReportUsecase, getClientProgressUsecase, getSessionHistoryUsecase) {
        this.getDashboardStatsUseCase = getDashboardStatsUseCase;
        this.getUpcomingSessionsUsecase = getUpcomingSessionsUsecase;
        this.getWeeklySessionStatsUsecase = getWeeklySessionStatsUsecase;
        this.getClientFeedbackUsecase = getClientFeedbackUsecase;
        this.getEarningsReportUsecase = getEarningsReportUsecase;
        this.getClientProgressUsecase = getClientProgressUsecase;
        this.getSessionHistoryUsecase = getSessionHistoryUsecase;
    }
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { year, month } = req.query;
                const stats = yield this.getDashboardStatsUseCase.execute(trainerId, parseInt(year), parseInt(month));
                res.status(200).json(stats);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getUpcomingSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { limit } = req.query;
                const sessions = yield this.getUpcomingSessionsUsecase.execute(trainerId, parseInt(limit));
                res.status(200).json(sessions);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getWeeklySessionStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { year, month } = req.query;
                const stats = yield this.getWeeklySessionStatsUsecase.execute(trainerId, parseInt(year), parseInt(month));
                res.status(200).json(stats);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getClientFeedback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { limit } = req.query;
                const feedback = yield this.getClientFeedbackUsecase.execute(trainerId, parseInt(limit));
                res.status(200).json(feedback);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getEarningsReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { year, month } = req.query;
                const report = yield this.getEarningsReportUsecase.execute(trainerId, parseInt(year), parseInt(month));
                res.status(200).json(report);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getClientProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const limitParam = req.query.limit;
                // Fallback to default value (3) if limit is invalid or missing
                const limit = Number.isNaN(parseInt(limitParam)) ? 3 : parseInt(limitParam);
                const progress = yield this.getClientProgressUsecase.execute(trainerId, limit);
                res.status(200).json(progress);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getSessionHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { trainerId } = req.params;
                const { date, clientId, status } = req.query;
                const history = yield this.getSessionHistoryUsecase.execute(trainerId, {
                    date: date,
                    clientId: clientId,
                    status: status
                });
                res.status(200).json(history);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
};
exports.TrainerDashboardController = TrainerDashboardController;
exports.TrainerDashboardController = TrainerDashboardController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetTrainerDashboardStatsUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetUpcomingSessionsUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetWeeklySessionStatsUseCase")),
    __param(3, (0, tsyringe_1.inject)("IGetClientFeedbackUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetEarningsReportUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetClientProgressUseCase")),
    __param(6, (0, tsyringe_1.inject)("IGetTrainerSessionHistoryUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TrainerDashboardController);
