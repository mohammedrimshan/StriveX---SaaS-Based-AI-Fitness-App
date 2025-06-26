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
exports.CreateCommentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const notification_service_1 = require("@/interfaceAdapters/services/notification.service");
let CreateCommentUseCase = class CreateCommentUseCase {
    constructor(commentRepository, postRepository, clientRepository, trainerRepository, notificationService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.clientRepository = clientRepository;
        this.trainerRepository = trainerRepository;
        this.notificationService = notificationService;
    }
    execute(data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield this.postRepository.findById(data.postId);
            if (!post)
                throw new Error("Post not found");
            const commentData = Object.assign(Object.assign({}, data), { authorId: userId, likes: [], isDeleted: false, reports: [] });
            const savedComment = yield this.commentRepository.save(commentData);
            if (post.authorId !== userId) {
                try {
                    // Fetch commenter name
                    let senderName = "Someone";
                    const client = yield this.clientRepository.findByClientNewId(userId);
                    if (client) {
                        senderName = `${client.firstName} ${client.lastName}`;
                    }
                    else {
                        const trainer = yield this.trainerRepository.findById(userId);
                        if (trainer) {
                            senderName = `${trainer.firstName} ${trainer.lastName}`;
                        }
                    }
                    yield this.notificationService.sendToUser(post.authorId, "New Comment", `${senderName} commented on your post!`, "INFO");
                }
                catch (error) {
                    console.error("Error sending notification:", error);
                }
            }
            return savedComment;
        });
    }
};
exports.CreateCommentUseCase = CreateCommentUseCase;
exports.CreateCommentUseCase = CreateCommentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("ICommentRepository")),
    __param(1, (0, tsyringe_1.inject)("IPostRepository")),
    __param(2, (0, tsyringe_1.inject)("IClientRepository")),
    __param(3, (0, tsyringe_1.inject)("ITrainerRepository")),
    __param(4, (0, tsyringe_1.inject)("NotificationService")),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notification_service_1.NotificationService])
], CreateCommentUseCase);
