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
exports.CommentRepository = void 0;
const tsyringe_1 = require("tsyringe");
const command_model_1 = require("@/frameworks/database/mongoDB/models/command.model");
const base_repository_1 = require("@/interfaceAdapters/repositories/base.repository");
let CommentRepository = class CommentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(command_model_1.CommentModel);
    }
    findByPostId(postId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const [items, total] = yield Promise.all([
                this.model
                    .find({ postId, isDeleted: false })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments({ postId, isDeleted: false }),
            ]);
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return { items: transformedItems, total };
        });
    }
    addLike(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this.model
                .findByIdAndUpdate(commentId, { $addToSet: { likes: userId } }, { new: true })
                .lean();
            return comment ? this.mapToEntity(comment) : null;
        });
    }
    removeLike(commentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this.model
                .findByIdAndUpdate(commentId, { $pull: { likes: userId } }, { new: true })
                .lean();
            return comment ? this.mapToEntity(comment) : null;
        });
    }
    addReport(commentId, report) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this.model
                .findByIdAndUpdate(commentId, { $push: { reports: report } }, { new: true })
                .lean();
            return comment ? this.mapToEntity(comment) : null;
        });
    }
    findReportedComments() {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.model
                .find({ "reports.0": { $exists: true } })
                .lean();
            return comments.map((comment) => this.mapToEntity(comment));
        });
    }
};
exports.CommentRepository = CommentRepository;
exports.CommentRepository = CommentRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CommentRepository);
