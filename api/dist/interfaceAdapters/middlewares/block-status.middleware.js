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
exports.BlockStatusMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants");
const cookieHelper_1 = require("../../shared/utils/cookieHelper");
let BlockStatusMiddleware = class BlockStatusMiddleware {
    constructor(clientRepository, trainerRepository, adminRepository, blacklistTokenUseCase, revokeRefreshTokenUseCase) {
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.adminRepository = adminRepository;
        this.blacklistTokenUseCase = blacklistTokenUseCase;
        this.revokeRefreshTokenUseCase = revokeRefreshTokenUseCase;
        this.checkStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                        status: "error",
                        message: "Unauthorized: No user found in request",
                    });
                    return;
                }
                const { id, role } = req.user;
                let status = "active";
                if (role === "client") {
                    const client = yield this.clientRepository.findById(id);
                    if (!client) {
                        res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                            success: false,
                            message: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
                        });
                        return;
                    }
                    status = client.status;
                }
                else if (role === "trainer") {
                    const trainer = yield this.trainerRepository.findById(id);
                    if (!trainer) {
                        res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                            success: false,
                            message: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
                        });
                        return;
                    }
                    status = trainer.status;
                }
                else if (role === "admin") {
                    // Add admin handling
                    const admin = yield this.adminRepository.findById(id);
                    if (!admin) {
                        console.log("BlockStatusMiddleware: Admin not found", { id });
                        res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                            success: false,
                            message: constants_1.ERROR_MESSAGES.USER_NOT_FOUND,
                        });
                        return;
                    }
                    status = admin.status;
                }
                else {
                    res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        message: constants_1.ERROR_MESSAGES.INVALID_ROLE,
                    });
                    return;
                }
                if (status !== "active") {
                    yield this.blacklistTokenUseCase.execute(req.user.access_token);
                    yield this.revokeRefreshTokenUseCase.execute(req.user.refresh_token);
                    const accessTokenName = `${role}_access_token`;
                    const refreshTokenName = `${role}_refresh_token`;
                    (0, cookieHelper_1.clearAuthCookies)(res, accessTokenName, refreshTokenName);
                    res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                        success: false,
                        message: "Access denied: Your account has been blocked",
                    });
                    return;
                }
                next();
            }
            catch (error) {
                console.log("Block Status MiddleWare Error: ", error);
                res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Internal server error while checking blocked status",
                });
                return;
            }
        });
    }
};
exports.BlockStatusMiddleware = BlockStatusMiddleware;
exports.BlockStatusMiddleware = BlockStatusMiddleware = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IClientRepository")),
    __param(1, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(2, (0, tsyringe_1.inject)("IAdminRepository")),
    __param(3, (0, tsyringe_1.inject)("IBlackListTokenUseCase")),
    __param(4, (0, tsyringe_1.inject)("IRevokeRefreshTokenUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BlockStatusMiddleware);
