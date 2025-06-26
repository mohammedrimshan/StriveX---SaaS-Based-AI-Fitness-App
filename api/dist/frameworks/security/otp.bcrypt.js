"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpBcrypt = void 0;
const config_1 = require("../../shared/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class OtpBcrypt {
    hash(original) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.hash(original, config_1.config.bcryptSaltRounds);
        });
    }
    compare(current, original) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(current, original);
        });
    }
}
exports.OtpBcrypt = OtpBcrypt;
