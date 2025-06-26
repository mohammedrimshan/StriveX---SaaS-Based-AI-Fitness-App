"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.OtpRepository = void 0;
const tsyringe_1 = require("tsyringe");
const otp_model_1 = require("@/frameworks/database/mongoDB/models/otp.model");
let OtpRepository = class OtpRepository {
    saveOtp(email, otp, expiresAt) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otp_model_1.OtpModel.create({ email, otp, expiresAt });
        });
    }
    findOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpEntry = yield otp_model_1.OtpModel.find({ email })
                .sort({ createdAt: -1 })
                .limit(1);
            return otpEntry.length > 0 ? otpEntry[0] : null;
        });
    }
    deleteOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otp_model_1.OtpModel.deleteOne({ email, otp });
        });
    }
};
exports.OtpRepository = OtpRepository;
exports.OtpRepository = OtpRepository = __decorate([
    (0, tsyringe_1.injectable)()
], OtpRepository);
