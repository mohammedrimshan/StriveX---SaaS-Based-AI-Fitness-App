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
exports.AdminDashboardController = void 0;
const tsyringe_1 = require("tsyringe");
const json2csv_1 = require("json2csv");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let AdminDashboardController = class AdminDashboardController {
    constructor(getDashboardStatsUseCase, getTopPerformingTrainersUseCase, getPopularWorkoutsUseCase, getUserAndSessionDataUseCase, getRevenueReportUseCase, getSessionReportUseCase) {
        this.getDashboardStatsUseCase = getDashboardStatsUseCase;
        this.getTopPerformingTrainersUseCase = getTopPerformingTrainersUseCase;
        this.getPopularWorkoutsUseCase = getPopularWorkoutsUseCase;
        this.getUserAndSessionDataUseCase = getUserAndSessionDataUseCase;
        this.getRevenueReportUseCase = getRevenueReportUseCase;
        this.getSessionReportUseCase = getSessionReportUseCase;
    }
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const stats = yield this.getDashboardStatsUseCase.execute(year);
                res.status(constants_1.HTTP_STATUS.OK).json(stats);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getTopPerformingTrainers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const trainers = yield this.getTopPerformingTrainersUseCase.execute(limit);
                res.status(constants_1.HTTP_STATUS.OK).json(trainers);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getPopularWorkouts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const workouts = yield this.getPopularWorkoutsUseCase.execute(limit);
                res.status(constants_1.HTTP_STATUS.OK).json(workouts);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    getUserAndSessionData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const type = req.query.type || "daily";
                const data = yield this.getUserAndSessionDataUseCase.execute(year, type);
                res.status(constants_1.HTTP_STATUS.OK).json(data);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    exportRevenueReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const data = yield this.getRevenueReportUseCase.execute(year);
                const fields = ["month", "totalRevenue", "totalTrainerEarnings", "totalProfit"];
                const parser = new json2csv_1.Parser({ fields });
                const csv = parser.parse(data);
                res.header("Content-Type", "text/csv");
                res.attachment(`revenue_report_${year}.csv`);
                res.send(csv);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
    exportSessionReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = parseInt(req.query.year) || new Date().getFullYear();
                const data = yield this.getSessionReportUseCase.execute(year);
                const fields = ["date", "totalSessions", "uniqueClientsCount"];
                const parser = new json2csv_1.Parser({ fields });
                const csv = parser.parse(data);
                res.header("Content-Type", "text/csv");
                res.attachment(`session_report_${year}.csv`);
                res.send(csv);
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(res, error);
            }
        });
    }
};
exports.AdminDashboardController = AdminDashboardController;
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetDashboardStatsUseCase")),
    __param(1, (0, tsyringe_1.inject)("IGetTopPerformingTrainersUseCase")),
    __param(2, (0, tsyringe_1.inject)("IGetPopularWorkoutsUseCase")),
    __param(3, (0, tsyringe_1.inject)("IGetUserAndSessionDataUseCase")),
    __param(4, (0, tsyringe_1.inject)("IGetRevenueReportUseCase")),
    __param(5, (0, tsyringe_1.inject)("IGetSessionReportUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], AdminDashboardController);
