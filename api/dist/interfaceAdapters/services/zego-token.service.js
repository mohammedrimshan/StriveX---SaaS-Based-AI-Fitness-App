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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZegoTokenService = void 0;
// D:\StriveX\api\src\interfaceAdapters\services\zego-token.service.ts
const tsyringe_1 = require("tsyringe");
const config_1 = require("@/shared/config");
const ZegoToken_1 = require("@/shared/utils/ZegoToken");
let ZegoTokenService = class ZegoTokenService {
    constructor() {
        const appID = parseInt(config_1.config.zegocloud.APP_ID);
        const serverSecret = config_1.config.zegocloud.SERVER_SECRET;
        if (isNaN(appID) || !serverSecret) {
            throw new Error("Invalid ZEGO_APP_ID or ZEGO_SERVER_SECRET in environment config");
        }
        this.appID = appID;
        this.serverSecret = serverSecret;
    }
    generateToken(userId, roomId, effectiveTimeInSeconds = 3600) {
        try {
            return ZegoToken_1.ZegoToken.generateToken04(this.appID, userId, this.serverSecret, effectiveTimeInSeconds, roomId);
        }
        catch (error) {
            console.error("Error generating Zego token:", error);
            throw new Error("Failed to generate Zego token");
        }
    }
};
exports.ZegoTokenService = ZegoTokenService;
exports.ZegoTokenService = ZegoTokenService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ZegoTokenService);
