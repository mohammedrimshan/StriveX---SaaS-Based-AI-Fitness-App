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
exports.MessageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const message_model_1 = require("@/frameworks/database/mongoDB/models/message.model");
const base_repository_1 = require("../base.repository");
let MessageRepository = class MessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(message_model_1.MessageModel);
    }
    getConversation(user1Id, user2Id, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                $or: [
                    { senderId: user1Id, receiverId: user2Id },
                    { senderId: user2Id, receiverId: user1Id },
                ],
                deleted: false,
            };
            const rawItems = yield this.model.find(filter).lean();
            const [items, total] = yield Promise.all([
                this.model
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(filter),
            ]);
            const transformedItems = items.map((item) => this.mapToEntity(item));
            return {
                items: transformedItems,
                total,
            };
        });
    }
    markMessagesAsRead(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.updateMany({ senderId, receiverId, status: "sent" }, { $set: { status: "read", readAt: new Date() } });
        });
    }
    getUnreadCount(receiverId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                receiverId,
                status: "sent",
                deleted: false,
            };
            if (senderId) {
                filter.senderId = senderId;
            }
            const count = yield this.model.countDocuments(filter);
            return count;
        });
    }
    getRecentChats(userId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        $or: [{ senderId: userId }, { receiverId: userId }],
                        deleted: false,
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $group: {
                        _id: {
                            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
                        },
                        lastMessage: { $first: "$$ROOT" },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$receiverId", userId] },
                                            { $eq: ["$status", "sent"] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userId: "$_id",
                        lastMessage: {
                            _id: "$lastMessage._id",
                            senderId: "$lastMessage.senderId",
                            receiverId: "$lastMessage.receiverId",
                            message: "$lastMessage.message",
                            status: "$lastMessage.status",
                            createdAt: "$lastMessage.createdAt",
                            updatedAt: "$lastMessage.updatedAt",
                            type: "$lastMessage.type",
                            mediaUrl: "$lastMessage.mediaUrl",
                            reactions: "$lastMessage.reactions",
                        },
                        unreadCount: 1,
                    },
                },
                {
                    $sort: { "lastMessage.createdAt": -1 },
                },
                {
                    $limit: limit,
                },
            ];
            const results = yield this.model.aggregate(pipeline).exec();
            return results.map((result) => ({
                userId: result.userId,
                lastMessage: this.mapToEntity(result.lastMessage),
                unreadCount: result.unreadCount,
            }));
        });
    }
    mapToEntity(doc) {
        const { _id, __v } = doc, rest = __rest(doc, ["_id", "__v"]);
        if (!_id) {
            throw new Error("Message document missing _id");
        }
        const entity = Object.assign(Object.assign({}, rest), { id: _id.toString(), reactions: rest.reactions || [] });
        return entity;
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MessageRepository);
