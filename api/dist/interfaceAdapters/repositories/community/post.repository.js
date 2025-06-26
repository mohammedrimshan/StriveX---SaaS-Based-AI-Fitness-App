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
exports.PostRepository = void 0;
const tsyringe_1 = require("tsyringe");
const post_model_1 = require("@/frameworks/database/mongoDB/models/post.model");
const base_repository_1 = require("@/interfaceAdapters/repositories/base.repository");
const custom_error_1 = require("@/entities/utils/custom.error");
const constants_1 = require("@/shared/constants");
let PostRepository = class PostRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(post_model_1.PostModel);
    }
    mapToEntity(doc) {
        const { _id, __v } = doc, rest = __rest(doc, ["_id", "__v"]);
        return Object.assign(Object.assign({}, rest), { id: _id === null || _id === void 0 ? void 0 : _id.toString(), author: doc.author || null, commentsCount: doc.commentsCount || 0, likes: doc.likes || [], reports: doc.reports || [], isDeleted: doc.isDeleted || false, createdAt: doc.createdAt || new Date(), updatedAt: doc.updatedAt || new Date(), textContent: doc.textContent || "", category: doc.category || "", authorId: doc.authorId || "", role: doc.role || "client" });
    }
    findByAuthorId(authorId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [items, total] = yield Promise.all([
                    this.model
                        .find({ authorId, isDeleted: false })
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .lean(),
                    this.model.countDocuments({ authorId, isDeleted: false }),
                ]);
                const transformedItems = items.map((item) => this.mapToEntity(item));
                return { items: transformedItems, total };
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to find posts by author ID", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    findWithFilters(filter, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = { isDeleted: false };
                if (filter.category)
                    query.category = filter.category;
                let sort = { createdAt: -1 };
                if (filter.sortBy === "likes")
                    sort = { "likes.length": -1 };
                else if (filter.sortBy === "comments")
                    sort = { commentsCount: -1 };
                const pipeline = [
                    { $match: query },
                    {
                        $lookup: {
                            from: "comments",
                            localField: "_id",
                            foreignField: "postId",
                            as: "comments",
                        },
                    },
                    {
                        $addFields: {
                            authorIdObjectId: {
                                $cond: {
                                    if: {
                                        $regexMatch: {
                                            input: "$authorId",
                                            regex: /^[0-9a-fA-F]{24}$/,
                                        },
                                    },
                                    then: { $toObjectId: "$authorId" },
                                    else: null,
                                },
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "trainers",
                            localField: "authorIdObjectId",
                            foreignField: "_id",
                            as: "trainerInfo",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        profileImage: 1,
                                        email: 1,
                                        role: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: "clients",
                            localField: "authorIdObjectId",
                            foreignField: "_id",
                            as: "clientInfo",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        firstName: 1,
                                        lastName: 1,
                                        email: 1,
                                        profileImage: 1,
                                        role: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            author: {
                                $cond: {
                                    if: { $gt: [{ $size: "$trainerInfo" }, 0] },
                                    then: { $arrayElemAt: ["$trainerInfo", 0] },
                                    else: {
                                        $cond: {
                                            if: { $gt: [{ $size: "$clientInfo" }, 0] },
                                            then: { $arrayElemAt: ["$clientInfo", 0] },
                                            else: null,
                                        },
                                    },
                                },
                            },
                            commentsCount: { $size: "$comments" },
                        },
                    },
                    { $sort: sort },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            comments: 0,
                            trainerInfo: 0,
                            clientInfo: 0,
                            authorIdObjectId: 0,
                        },
                    },
                ];
                const result = yield this.model.aggregate(pipeline).exec();
                const total = yield this.model.countDocuments(query);
                const transformedItems = result.map((item) => this.mapToEntity(item));
                return { items: transformedItems, total };
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to execute aggregation pipeline", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    addLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield this.model
                    .findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true })
                    .lean();
                return post ? this.mapToEntity(post) : null;
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to add like", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    removeLike(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield this.model
                    .findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
                    .lean();
                return post ? this.mapToEntity(post) : null;
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to remove like", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    addReport(postId, report) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield this.model
                    .findByIdAndUpdate(postId, { $push: { reports: report } }, { new: true })
                    .lean();
                return post ? this.mapToEntity(post) : null;
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to add report", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    findReportedPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield this.model
                    .find({ "reports.0": { $exists: true } })
                    .lean();
                return posts.map((post) => this.mapToEntity(post));
            }
            catch (error) {
                throw new custom_error_1.CustomError("Failed to find reported posts", constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
};
exports.PostRepository = PostRepository;
exports.PostRepository = PostRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PostRepository);
