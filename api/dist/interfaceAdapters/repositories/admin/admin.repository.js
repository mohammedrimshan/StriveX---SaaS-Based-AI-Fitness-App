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
exports.AdminRepository = void 0;
const tsyringe_1 = require("tsyringe");
const admin_model_1 = require("@/frameworks/database/mongoDB/models/admin.model");
const base_repository_1 = require("../base.repository");
let AdminRepository = class AdminRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(admin_model_1.AdminModel);
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield admin_model_1.AdminModel.findOne({ email }).lean();
            if (!admin)
                return null;
            return Object.assign(Object.assign({}, admin), { id: admin._id.toString() });
        });
    }
    updateByEmail(email, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield admin_model_1.AdminModel.findOneAndUpdate({ email }, { $set: updates }, { new: true }).lean();
            if (!admin)
                return null;
            return Object.assign(Object.assign({}, admin), { id: admin._id.toString() });
        });
    }
    findByIdAndUpdate(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.model
                .findByIdAndUpdate(id, { $set: updateData }, { new: true })
                .lean();
            return client ? this.mapToEntity(client) : null;
        });
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], AdminRepository);
