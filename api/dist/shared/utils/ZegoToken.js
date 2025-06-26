"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZegoToken = void 0;
// D:\StriveX\api\src\shared\utils\zego-token.ts
const crypto = __importStar(require("crypto"));
class ZegoToken {
    static generateToken04(appID, userID, serverSecret, effectiveTimeInSeconds, roomID) {
        const nonce = Math.floor(Math.random() * 1000000000); // Larger nonce for uniqueness
        const ctime = Math.floor(Date.now() / 1000);
        const expire = ctime + effectiveTimeInSeconds; // Expire as timestamp
        const payload = {
            app_id: appID,
            user_id: userID,
            nonce,
            ctime,
            expire,
            room_id: roomID,
        };
        const payloadStr = JSON.stringify(payload);
        const hash = crypto
            .createHmac("sha256", serverSecret)
            .update(payloadStr)
            .digest("hex");
        const tokenObj = {
            ver: 4,
            hash,
            payload: payloadStr,
        };
        return Buffer.from(JSON.stringify(tokenObj)).toString("base64");
    }
}
exports.ZegoToken = ZegoToken;
