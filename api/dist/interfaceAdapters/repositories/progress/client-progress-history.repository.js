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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProgressHistoryRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const client_progress_history_model_1 = require("@/frameworks/database/mongoDB/models/client.progress.history.model");
const base_repository_1 = require("../base.repository");
let ClientProgressHistoryRepository = class ClientProgressHistoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_progress_history_model_1.ClientProgressHistoryModel);
    }
    findLatestByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestEntry = yield this.model
                .findOne({ userId: new mongoose_1.Types.ObjectId(userId) })
                .sort({ date: -1 })
                .lean();
            return latestEntry ? this.mapToEntity(latestEntry) : null;
        });
    }
    mapToEntity(doc) {
        const { _id, __v, userId } = doc, rest = __rest(doc, ["_id", "__v", "userId"]);
        return Object.assign(Object.assign({}, rest), { userId: userId === null || userId === void 0 ? void 0 : userId.toString(), id: _id === null || _id === void 0 ? void 0 : _id.toString() });
    }
};
exports.ClientProgressHistoryRepository = ClientProgressHistoryRepository;
exports.ClientProgressHistoryRepository = ClientProgressHistoryRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ClientProgressHistoryRepository);
