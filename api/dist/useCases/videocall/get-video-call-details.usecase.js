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
exports.GetVideoCallDetailsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
const zego_token_service_1 = require("@/interfaceAdapters/services/zego-token.service");
let GetVideoCallDetailsUseCase = class GetVideoCallDetailsUseCase {
    constructor(_slotRepository, _zegoTokenService) {
        this._slotRepository = _slotRepository;
        this._zegoTokenService = _zegoTokenService;
    }
    execute(slotId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield this._slotRepository.findById(slotId);
            if (!slot) {
                throw new custom_error_1.CustomError("Slot not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if ((role === constants_1.ROLES.TRAINER && slot.trainerId.toString() !== userId) ||
                (role === constants_1.ROLES.USER && slot.clientId !== userId)) {
                throw new custom_error_1.CustomError("Unauthorized: You do not have access to this slot", constants_1.HTTP_STATUS.FORBIDDEN);
            }
            const videoCallDetails = yield this._slotRepository.getVideoCallDetails(slotId);
            if (!videoCallDetails) {
                throw new custom_error_1.CustomError("Video call details not found", constants_1.HTTP_STATUS.NOT_FOUND);
            }
            if (videoCallDetails.videoCallStatus !== constants_1.VideoCallStatus.IN_PROGRESS) {
                throw new custom_error_1.CustomError(`Video call is not in progress (current status: ${videoCallDetails.videoCallStatus})`, constants_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!videoCallDetails.videoCallRoomName) {
                throw new custom_error_1.CustomError("Video call room name missing", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            const token = this._zegoTokenService.generateToken(userId, videoCallDetails.videoCallRoomName);
            return {
                roomName: videoCallDetails.videoCallRoomName,
                token,
            };
        });
    }
};
exports.GetVideoCallDetailsUseCase = GetVideoCallDetailsUseCase;
exports.GetVideoCallDetailsUseCase = GetVideoCallDetailsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ISlotRepository")),
    __param(1, (0, tsyringe_1.inject)("ZegoTokenService")),
    __metadata("design:paramtypes", [Object, zego_token_service_1.ZegoTokenService])
], GetVideoCallDetailsUseCase);
