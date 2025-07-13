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
exports.VideoCallController = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const errorHandler_1 = require("@/shared/utils/errorHandler");
let VideoCallController = class VideoCallController {
    constructor(getVideoCallDetailsUseCase, endVideoCallUseCase, startVideoCallUseCase, joinVideoCallUseCase) {
        this.getVideoCallDetailsUseCase = getVideoCallDetailsUseCase;
        this.endVideoCallUseCase = endVideoCallUseCase;
        this.startVideoCallUseCase = startVideoCallUseCase;
        this.joinVideoCallUseCase = joinVideoCallUseCase;
    }
    startVideoCall(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { slotId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError("Unauthorized: Missing user ID or role", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (role !== "trainer" && role !== "client") {
                    throw new custom_error_1.CustomError("Invalid role", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedSlot = yield this.startVideoCallUseCase.execute(slotId, userId, role);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Video call started successfully",
                    videoCallDetails: {
                        roomName: updatedSlot.videoCallRoomName,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    joinVideoCall(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { slotId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError("Unauthorized: Missing user ID or role", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (role !== "trainer" && role !== "client") {
                    throw new custom_error_1.CustomError("Invalid role", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const slot = yield this.joinVideoCallUseCase.execute(slotId, userId, role);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Joined video call successfully",
                    videoCallDetails: {
                        roomName: slot.videoCallRoomName,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    getVideoCallDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { slotId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError("Unauthorized: Missing user ID or role", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (role !== "trainer" && role !== "client") {
                    throw new custom_error_1.CustomError("Invalid role", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const videoCallDetails = yield this.getVideoCallDetailsUseCase.execute(slotId, userId, role);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    videoCallDetails: {
                        roomName: videoCallDetails.roomName,
                        token: videoCallDetails.token,
                    },
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
    endVideoCall(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { slotId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const role = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId || !role) {
                    throw new custom_error_1.CustomError("Unauthorized: Missing user ID or role", constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (role !== "trainer" && role !== "client") {
                    throw new custom_error_1.CustomError("Invalid role", constants_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedSlot = yield this.endVideoCallUseCase.execute(slotId, userId, role);
                res.status(constants_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Video call ended successfully",
                    videoCallStatus: updatedSlot.videoCallStatus,
                });
            }
            catch (error) {
                (0, errorHandler_1.handleErrorResponse)(req, res, error);
            }
        });
    }
};
exports.VideoCallController = VideoCallController;
exports.VideoCallController = VideoCallController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("IGetVideoCallDetailsUseCase")),
    __param(1, (0, tsyringe_1.inject)("IEndVideoCallUseCase")),
    __param(2, (0, tsyringe_1.inject)("IStartVideoCallUseCase")),
    __param(3, (0, tsyringe_1.inject)("IJoinVideoCallUseCase")),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], VideoCallController);
