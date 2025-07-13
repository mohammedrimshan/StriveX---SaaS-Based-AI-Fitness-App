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
exports.ClientWalletController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let ClientWalletController = class ClientWalletController {
    constructor(getClientWalletDetailsUseCase) {
        this.getClientWalletDetailsUseCase = getClientWalletDetailsUseCase;
    }
    getWalletDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = req.user.id;
                const { year, month, page = 1, limit = 10 } = req.query;
                if (!clientId) {
                    throw new custom_error_1.CustomError(constants_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!year || !month) {
                    throw new custom_error_1.CustomError("Year and month are required", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const pageNumber = Number(page);
                const pageSize = Number(limit);
                if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
                    throw new custom_error_1.CustomError("Invalid pagination parameters", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const walletDetails = yield this.getClientWalletDetailsUseCase.execute(clientId, Number(year), Number(month), (pageNumber - 1) * pageSize, pageSize);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constants_1.SUCCESS_MESSAGES.DATA_RETRIEVED,
                    data: {
                        wallet: walletDetails.wallet,
                        monthlyTransactionCount: walletDetails.monthlyTransactionCount,
                        totalTransactionCount: walletDetails.totalTransactionCount,
                        totalTransactionAmount: walletDetails.totalTransactionAmount,
                        transactions: walletDetails.transactions.items,
                        totalPages: Math.ceil(walletDetails.transactions.total / pageSize),
                        currentPage: pageNumber,
                        totalTransactions: walletDetails.transactions.total,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.ClientWalletController = ClientWalletController;
exports.ClientWalletController = ClientWalletController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetClientWalletDetailsUseCase")),
    __metadata("design:paramtypes", [Object])
], ClientWalletController);
